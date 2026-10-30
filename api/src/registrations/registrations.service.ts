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
import { deadlineOf, nowInBrasilia } from './deadline.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CAMPOS_MINIMOS,
  type OpenRegistrationDto,
  type RegistrationResponse,
  type UpdateRegistrationDto,
} from './registrations.dto.js';

type RegistrationRow = Prisma.ConfiguracaoInscricaoGetPayload<object>;

const FIELDS = [
  'aberta',
  'vagas',
  'camposAdicionais',
  'campoDuplicidade',
  'termoCompromisso',
  'apresentacao',
  'prazoInscricao',
  'prazoHora',
  'contatoWhatsapp',
] as const;
type Field = (typeof FIELDS)[number];

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function toDate(isoDay: string | null): Date | null {
  return isoDay ? new Date(`${isoDay}T00:00:00.000Z`) : null;
}

function hourOf(time: Date | null): string | null {
  return time ? time.toISOString().slice(11, 16) : null;
}

function toTime(hour: string | null): Date | null {
  return hour ? new Date(`1970-01-01T${hour}:00.000Z`) : null;
}

function toResponse(row: RegistrationRow): RegistrationResponse {
  return {
    atividadeId: row.atividadeId,
    versao: row.versao,
    aberta: row.aberta,
    vagas: row.vagas,
    camposMinimos: [...CAMPOS_MINIMOS],
    camposAdicionais: [...row.camposAdicionais].sort(),
    campoDuplicidade: row.campoDuplicidade,
    termoCompromisso: row.termoCompromisso,
    apresentacao: row.apresentacao,
    prazoInscricao: isoDate(row.prazoInscricao),
    prazoHora: hourOf(row.prazoHora),
    contatoWhatsapp: row.contatoWhatsapp,
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

/**
 * O prazo vai de agora (Brasília) até a data da atividade, inclusive; a hora é opcional e só
 * existe junto da data.
 */
function assertDeadline(
  prazo: string | null,
  hora: string | null,
  atividadeData: Date,
  now: Date = new Date(),
): void {
  if (prazo === null) {
    if (hora !== null) {
      throw new BadRequestException({
        code: 'DEADLINE_INVALID',
        message: 'Informe a data do prazo antes da hora.',
      });
    }
    return;
  }
  const dataAtividade = isoDate(atividadeData)!;
  if (deadlineOf(prazo, hora) < nowInBrasilia(now) || prazo > dataAtividade) {
    throw new BadRequestException({
      code: 'DEADLINE_INVALID',
      message: `O prazo de inscrição precisa ir de agora até a data da atividade, ${dataAtividade.split('-').reverse().join('/')}.`,
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
      const atividade = await this.assertEditableActivity(tx, atividadeId);
      assertDeadline(data.prazoInscricao ?? null, data.prazoHora ?? null, atividade.data);
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
          termoCompromisso: data.termoCompromisso ?? null,
          apresentacao: data.apresentacao ?? null,
          prazoInscricao: toDate(data.prazoInscricao ?? null),
          prazoHora: toTime(data.prazoHora ?? null),
          contatoWhatsapp: data.contatoWhatsapp ?? null,
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
      const atividade = await this.assertEditableActivity(tx, atividadeId);
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
        termoCompromisso:
          changes.termoCompromisso === undefined
            ? before.termoCompromisso
            : changes.termoCompromisso,
        apresentacao:
          changes.apresentacao === undefined ? before.apresentacao : changes.apresentacao,
        prazoInscricao:
          changes.prazoInscricao === undefined ? before.prazoInscricao : changes.prazoInscricao,
        prazoHora: changes.prazoHora === undefined ? before.prazoHora : changes.prazoHora,
        contatoWhatsapp:
          changes.contatoWhatsapp === undefined ? before.contatoWhatsapp : changes.contatoWhatsapp,
      };
      assertKeyAsked(next.camposAdicionais, next.campoDuplicidade);
      if (next.prazoInscricao !== before.prazoInscricao || next.prazoHora !== before.prazoHora) {
        assertDeadline(next.prazoInscricao, next.prazoHora, atividade.data);
      }
      const changed = FIELDS.filter((field) => !same(field, before, next));
      if (changed.length === 0) return before;

      const updated = await tx.configuracaoInscricao.updateMany({
        where: { atividadeId, versao },
        data: {
          aberta: next.aberta,
          vagas: next.vagas,
          camposAdicionais: next.camposAdicionais,
          campoDuplicidade: next.campoDuplicidade,
          termoCompromisso: next.termoCompromisso,
          apresentacao: next.apresentacao,
          prazoInscricao: toDate(next.prazoInscricao),
          prazoHora: toTime(next.prazoHora),
          contatoWhatsapp: next.contatoWhatsapp,
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
  ): Promise<{ data: Date }> {
    const atividade = await tx.atividade.findUnique({
      where: { id: atividadeId },
      select: { data: true, projeto: { select: { instrumento: { select: { ativo: true } } } } },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada.');
    if (!atividade.projeto.instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está inativo e não abre nem altera inscrições.',
      });
    }
    return { data: atividade.data };
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A inscrição foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
