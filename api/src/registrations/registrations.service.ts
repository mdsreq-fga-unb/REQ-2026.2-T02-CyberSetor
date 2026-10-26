import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CAMPOS_MINIMOS,
  type OpenRegistrationDto,
  type RegistrationResponse,
  type UpdateRegistrationDto,
} from './registrations.dto.js';

type RegistrationRow = Prisma.ConfiguracaoInscricaoGetPayload<object>;

const FIELDS = ['aberta', 'vagas', 'camposAdicionais', 'campoDuplicidade'] as const;
type Field = (typeof FIELDS)[number];

function toResponse(row: RegistrationRow): RegistrationResponse {
  return {
    atividadeId: row.atividadeId,
    versao: row.versao,
    aberta: row.aberta,
    vagas: row.vagas,
    camposMinimos: [...CAMPOS_MINIMOS],
    camposAdicionais: [...row.camposAdicionais].sort(),
    campoDuplicidade: row.campoDuplicidade,
    codigoPublico: row.codigoPublico,
    linkPublico: `/inscrever/${row.codigoPublico}`,
  };
}

function same(field: Field, left: RegistrationResponse, right: RegistrationResponse): boolean {
  return JSON.stringify(left[field]) === JSON.stringify(right[field]);
}

function assertKeyAsked(campos: readonly string[], chave: string): void {
  if (!campos.includes(chave)) {
    throw new BadRequestException({
      code: 'DUPLICATE_KEY_NOT_ASKED',
      message: 'O campo que identifica cadastro repetido precisa estar entre os campos pedidos.',
    });
  }
}

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async get(atividadeId: string): Promise<RegistrationResponse> {
    const row = await this.prisma.configuracaoInscricao.findUnique({ where: { atividadeId } });
    if (!row) {
      await this.assertActivityExists(this.prisma, atividadeId);
      throw new NotFoundException({
        code: 'REGISTRATION_NOT_OPENED',
        message: 'A inscrição desta atividade ainda não foi aberta.',
      });
    }
    return toResponse(row);
  }

  async open(
    atividadeId: string,
    data: OpenRegistrationDto,
    actor: Actor,
  ): Promise<RegistrationResponse> {
    assertKeyAsked(data.camposAdicionais, data.campoDuplicidade);
    return this.prisma.$transaction(async (tx) => {
      await this.assertEditableActivity(tx, atividadeId);
      const existing = await tx.configuracaoInscricao.count({ where: { atividadeId } });
      if (existing > 0) {
        throw new ConflictException({
          code: 'REGISTRATION_ALREADY_OPENED',
          message: 'A inscrição desta atividade já foi aberta; edite a configuração existente.',
        });
      }
      const row = await tx.configuracaoInscricao.create({
        data: {
          atividadeId,
          vagas: data.vagas,
          camposAdicionais: data.camposAdicionais,
          campoDuplicidade: data.campoDuplicidade,
          codigoPublico: randomBytes(12).toString('base64url'),
        },
      });
      const inscricao = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'REGISTRATION_OPENED',
          entidade: 'configuracao_inscricao',
          entidadeId: atividadeId,
          depois: Object.fromEntries(FIELDS.map((field) => [field, inscricao[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return inscricao;
    });
  }

  async update(
    atividadeId: string,
    { versao, ...changes }: UpdateRegistrationDto,
    actor: Actor,
  ): Promise<RegistrationResponse> {
    return this.prisma.$transaction(async (tx) => {
      await this.assertEditableActivity(tx, atividadeId);
      const current = await tx.configuracaoInscricao.findUnique({ where: { atividadeId } });
      if (!current) {
        throw new NotFoundException({
          code: 'REGISTRATION_NOT_OPENED',
          message: 'A inscrição desta atividade ainda não foi aberta.',
        });
      }
      if (current.versao !== versao) throw this.versionConflict();

      const before = toResponse(current);
      const next: RegistrationResponse = {
        ...before,
        aberta: changes.aberta ?? before.aberta,
        vagas: changes.vagas ?? before.vagas,
        camposAdicionais: changes.camposAdicionais
          ? [...changes.camposAdicionais].sort()
          : before.camposAdicionais,
        campoDuplicidade: changes.campoDuplicidade ?? before.campoDuplicidade,
      };
      assertKeyAsked(next.camposAdicionais, next.campoDuplicidade);
      const changed = FIELDS.filter((field) => !same(field, before, next));
      if (changed.length === 0) return before;

      const updated = await tx.configuracaoInscricao.updateMany({
        where: { atividadeId, versao },
        data: {
          aberta: next.aberta,
          vagas: next.vagas,
          camposAdicionais: next.camposAdicionais,
          campoDuplicidade: next.campoDuplicidade,
          versao: { increment: 1 },
        },
      });
      if (updated.count === 0) throw this.versionConflict();

      const inscricao = toResponse(
        await tx.configuracaoInscricao.findUniqueOrThrow({ where: { atividadeId } }),
      );
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao:
            changed.length === 1 && changed[0] === 'aberta'
              ? inscricao.aberta
                ? 'REGISTRATION_REOPENED'
                : 'REGISTRATION_CLOSED'
              : 'REGISTRATION_UPDATED',
          entidade: 'configuracao_inscricao',
          entidadeId: atividadeId,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, inscricao[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return inscricao;
    });
  }

  private async assertActivityExists(
    client: Prisma.TransactionClient | PrismaService,
    atividadeId: string,
  ): Promise<void> {
    const count = await client.atividade.count({ where: { id: atividadeId } });
    if (count === 0) throw new NotFoundException('Atividade não encontrada.');
  }

  private async assertEditableActivity(
    tx: Prisma.TransactionClient,
    atividadeId: string,
  ): Promise<void> {
    const atividade = await tx.atividade.findUnique({
      where: { id: atividadeId },
      select: { projeto: { select: { instrumento: { select: { ativo: true } } } } },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada.');
    if (!atividade.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está inativo e não abre nem altera inscrições.',
      });
    }
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A inscrição foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
