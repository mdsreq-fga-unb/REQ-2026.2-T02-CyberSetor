import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateRequirementDto,
  RequirementResponse,
  UpdateRequirementDto,
} from './requirements.dto.js';

type RequirementRow = Prisma.RequisitoInstrumentoGetPayload<object>;
type InstrumentRow = Prisma.InstrumentoGetPayload<object>;

const FIELDS = ['descricao', 'referencia'] as const;

function toResponse(row: RequirementRow): RequirementResponse {
  return {
    id: row.id,
    versao: row.versao,
    instrumentoId: row.instrumentoId,
    descricao: row.descricao,
    referencia: row.referencia,
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  return value === undefined || value === '' ? null : value;
}

function assertActive(instrument: InstrumentRow): void {
  if (!instrument.ativo) {
    throw new ConflictException({
      code: 'INSTRUMENT_INACTIVE',
      message: 'O instrumento está inativo e não recebe nem altera requisitos.',
    });
  }
}

@Injectable()
export class RequirementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(instrumentoId: string): Promise<RequirementResponse[]> {
    await this.instrument(this.prisma, instrumentoId);
    const rows = await this.prisma.requisitoInstrumento.findMany({
      where: { instrumentoId },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toResponse);
  }

  async create(
    instrumentoId: string,
    data: CreateRequirementDto,
    actor: Actor,
  ): Promise<RequirementResponse> {
    return this.prisma.$transaction(async (tx) => {
      assertActive(await this.instrument(tx, instrumentoId));
      const row = await tx.requisitoInstrumento.create({
        data: {
          instrumentoId,
          descricao: data.descricao,
          referencia: emptyToNull(data.referencia),
        },
      });
      const requisito = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'REQUIREMENT_CREATED',
          entidade: 'requisito_instrumento',
          entidadeId: row.id,
          depois: {
            instrumentoId,
            descricao: requisito.descricao,
            referencia: requisito.referencia,
          },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return requisito;
    });
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateRequirementDto,
    actor: Actor,
  ): Promise<RequirementResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.requisitoInstrumento.findUnique({
        where: { id },
        include: { instrumento: true },
      });
      if (!current) throw new NotFoundException('Requisito não encontrado.');
      if (current.versao !== versao) throw this.versionConflict();
      assertActive(current.instrumento);

      const before = toResponse(current);
      const next = {
        descricao: changes.descricao ?? before.descricao,
        referencia:
          changes.referencia === undefined ? before.referencia : emptyToNull(changes.referencia),
      };
      const changed = FIELDS.filter((field) => next[field] !== before[field]);
      if (changed.length === 0) return before;

      const updated = await tx.requisitoInstrumento.updateMany({
        where: { id, versao },
        data: { ...next, versao: { increment: 1 } },
      });
      if (updated.count === 0) throw this.versionConflict();

      const requisito = toResponse(
        await tx.requisitoInstrumento.findUniqueOrThrow({ where: { id } }),
      );
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'REQUIREMENT_UPDATED',
          entidade: 'requisito_instrumento',
          entidadeId: id,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, requisito[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return requisito;
    });
  }

  private async instrument(
    client: Prisma.TransactionClient,
    instrumentoId: string,
  ): Promise<InstrumentRow> {
    const instrument = await client.instrumento.findUnique({ where: { id: instrumentoId } });
    if (!instrument) throw new NotFoundException('Instrumento não encontrado.');
    return instrument;
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'O requisito foi alterado por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
