import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateSectorDto, SectorResponse, UpdateSectorDto } from './sectors.dto.js';

type SectorRow = Prisma.SetorGetPayload<object>;

const FIELDS = ['nome', 'ativo'] as const;

function toResponse(row: SectorRow): SectorResponse {
  return { id: row.id, versao: row.versao, nome: row.nome, ativo: row.ativo };
}

@Injectable()
export class SectorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(ativo?: boolean): Promise<SectorResponse[]> {
    const rows = await this.prisma.setor.findMany({
      where: ativo === undefined ? {} : { ativo },
      orderBy: { nome: 'asc' },
    });
    return rows.map(toResponse);
  }

  async create(data: CreateSectorDto, actor: Actor): Promise<SectorResponse> {
    return this.withNameConflict(() =>
      this.prisma.$transaction(async (tx) => {
        await this.assertNameFree(tx, data.nome);
        const setor = toResponse(await tx.setor.create({ data: { nome: data.nome } }));
        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'SECTOR_CREATED',
            entidade: 'setor',
            entidadeId: setor.id,
            depois: { nome: setor.nome, ativo: setor.ativo },
            correlationId: actor.correlationId,
          },
          tx,
        );
        return setor;
      }),
    );
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateSectorDto,
    actor: Actor,
  ): Promise<SectorResponse> {
    return this.withNameConflict(() =>
      this.prisma.$transaction(async (tx) => {
        const current = await tx.setor.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Setor não encontrado.');
        if (current.versao !== versao) throw this.versionConflict();

        const before = toResponse(current);
        const next = { nome: changes.nome ?? before.nome, ativo: changes.ativo ?? before.ativo };
        const changed = FIELDS.filter((field) => next[field] !== before[field]);
        if (changed.length === 0) return before;
        if (changed.includes('nome')) await this.assertNameFree(tx, next.nome, id);

        const updated = await tx.setor.updateMany({
          where: { id, versao },
          data: { ...next, versao: { increment: 1 } },
        });
        if (updated.count === 0) throw this.versionConflict();

        const setor = toResponse(await tx.setor.findUniqueOrThrow({ where: { id } }));
        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'SECTOR_UPDATED',
            entidade: 'setor',
            entidadeId: id,
            antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
            depois: Object.fromEntries(changed.map((field) => [field, setor[field]])),
            correlationId: actor.correlationId,
          },
          tx,
        );
        return setor;
      }),
    );
  }

  private async assertNameFree(
    tx: Prisma.TransactionClient,
    nome: string,
    exceptId?: string,
  ): Promise<void> {
    const taken = await tx.setor.count({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    if (taken > 0) throw this.nameConflict();
  }

  private async withNameConflict<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.nameConflict();
      }
      throw error;
    }
  }

  private nameConflict(): ConflictException {
    return new ConflictException({
      code: 'SECTOR_NAME_TAKEN',
      message: 'Já existe setor com este nome.',
    });
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'O setor foi alterado por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
