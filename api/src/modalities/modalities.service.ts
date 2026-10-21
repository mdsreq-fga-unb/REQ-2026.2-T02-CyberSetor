import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateModalityDto, ModalityResponse, UpdateModalityDto } from './modalities.dto.js';

type ModalityRow = Prisma.ModalidadeGetPayload<object>;

const FIELDS = ['nome', 'descricao', 'ativo'] as const;

function toResponse(row: ModalityRow): ModalityResponse {
  return {
    id: row.id,
    versao: row.versao,
    nome: row.nome,
    descricao: row.descricao,
    ativo: row.ativo,
  };
}

function emptyToNull(value: string | null | undefined): string | null | undefined {
  return value === '' ? null : value;
}

@Injectable()
export class ModalitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(ativo?: boolean): Promise<ModalityResponse[]> {
    const rows = await this.prisma.modalidade.findMany({
      where: ativo === undefined ? {} : { ativo },
      orderBy: { nome: 'asc' },
    });
    return rows.map(toResponse);
  }

  async get(id: string): Promise<ModalityResponse> {
    const row = await this.prisma.modalidade.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Modalidade não encontrada.');
    return toResponse(row);
  }

  async create(data: CreateModalityDto, actor: Actor): Promise<ModalityResponse> {
    return this.prisma.$transaction(async (tx) => {
      await this.assertNameFree(tx, data.nome);
      const row = await tx.modalidade.create({
        data: { nome: data.nome, descricao: emptyToNull(data.descricao) ?? null },
      });
      const modalidade = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'MODALITY_CREATED',
          entidade: 'modalidade',
          entidadeId: row.id,
          depois: { nome: modalidade.nome, descricao: modalidade.descricao, ativo: true },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return modalidade;
    });
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateModalityDto,
    actor: Actor,
  ): Promise<ModalityResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.modalidade.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Modalidade não encontrada.');
      if (current.versao !== versao) throw this.versionConflict();

      const before = toResponse(current);
      const next = {
        nome: changes.nome ?? before.nome,
        descricao:
          changes.descricao === undefined
            ? before.descricao
            : (emptyToNull(changes.descricao) ?? null),
        ativo: changes.ativo ?? before.ativo,
      };
      const changed = FIELDS.filter((field) => next[field] !== before[field]);
      if (changed.length === 0) return before;
      if (changed.includes('nome')) await this.assertNameFree(tx, next.nome, id);

      const updated = await tx.modalidade.updateMany({
        where: { id, versao },
        data: { ...next, versao: { increment: 1 } },
      });
      if (updated.count === 0) throw this.versionConflict();

      const modalidade = toResponse(await tx.modalidade.findUniqueOrThrow({ where: { id } }));
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'MODALITY_UPDATED',
          entidade: 'modalidade',
          entidadeId: id,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, modalidade[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return modalidade;
    });
  }

  private async assertNameFree(
    tx: Prisma.TransactionClient,
    nome: string,
    exceptId?: string,
  ): Promise<void> {
    const taken = await tx.modalidade.count({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    if (taken > 0) throw new ConflictException('Já existe modalidade com este nome.');
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A modalidade foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
