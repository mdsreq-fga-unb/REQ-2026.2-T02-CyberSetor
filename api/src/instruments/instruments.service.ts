import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Actor } from '../accounts/accounts.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateInstrumentDto,
  InstrumentResponse,
  SavedInstrumentResponse,
  UpdateInstrumentDto,
} from './instruments.dto.js';

type InstrumentRow = Prisma.InstrumentoGetPayload<object>;

const FIELDS = [
  'tipo',
  'orgaoConcedente',
  'numeroProcesso',
  'valorGlobal',
  'dataCelebracao',
  'vigenciaInicio',
  'vigenciaFim',
] as const;

function toDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`Data inexistente: ${value}.`);
  }
  return date;
}

function toResponse(row: InstrumentRow): InstrumentResponse {
  return {
    id: row.id,
    versao: row.versao,
    tipo: row.tipo,
    orgaoConcedente: row.orgaoConcedente,
    numeroProcesso: row.numeroProcesso,
    valorGlobal: row.valorGlobal.toFixed(2),
    dataCelebracao: row.dataCelebracao.toISOString().slice(0, 10),
    vigenciaInicio: row.vigenciaInicio.toISOString().slice(0, 10),
    vigenciaFim: row.vigenciaFim.toISOString().slice(0, 10),
    ativo: row.ativo,
  };
}

function snapshot(response: InstrumentResponse): Prisma.InputJsonObject {
  return Object.fromEntries(FIELDS.map((field) => [field, response[field]]));
}

function validate(values: Omit<InstrumentResponse, 'id' | 'versao' | 'ativo'>): void {
  [values.dataCelebracao, values.vigenciaInicio, values.vigenciaFim].forEach(toDate);
  if (Number(values.valorGlobal) <= 0) {
    throw new BadRequestException('O valor global deve ser maior que zero.');
  }
  if (values.vigenciaFim < values.vigenciaInicio) {
    throw new BadRequestException('O fim da vigência não pode ser anterior ao início.');
  }
}

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(ativo?: boolean): Promise<InstrumentResponse[]> {
    const rows = await this.prisma.instrumento.findMany({
      where: ativo === undefined ? {} : { ativo },
      orderBy: [{ vigenciaInicio: 'desc' }, { criadoEm: 'desc' }],
    });
    return rows.map(toResponse);
  }

  async get(id: string): Promise<InstrumentResponse> {
    const row = await this.prisma.instrumento.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Instrumento não encontrado.');
    return toResponse(row);
  }

  async create(data: CreateInstrumentDto, actor: Actor): Promise<SavedInstrumentResponse> {
    validate(data);
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.instrumento.create({
        data: {
          tipo: data.tipo,
          orgaoConcedente: data.orgaoConcedente,
          numeroProcesso: data.numeroProcesso,
          valorGlobal: new Prisma.Decimal(data.valorGlobal),
          dataCelebracao: toDate(data.dataCelebracao),
          vigenciaInicio: toDate(data.vigenciaInicio),
          vigenciaFim: toDate(data.vigenciaFim),
        },
      });
      const instrumento = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'INSTRUMENT_CREATED',
          entidade: 'instrumento',
          entidadeId: row.id,
          depois: snapshot(instrumento),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return { instrumento, numeroProcessoRepetido: await this.processUsedElsewhere(tx, row) };
    });
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateInstrumentDto,
    actor: Actor,
  ): Promise<SavedInstrumentResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.instrumento.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Instrumento não encontrado.');
      if (current.versao !== versao) throw this.versionConflict();

      const before = toResponse(current);
      const merged = { ...before, ...changes };
      validate(merged);

      const updated = await tx.instrumento.updateMany({
        where: { id, versao },
        data: {
          tipo: merged.tipo,
          orgaoConcedente: merged.orgaoConcedente,
          numeroProcesso: merged.numeroProcesso,
          valorGlobal: new Prisma.Decimal(merged.valorGlobal),
          dataCelebracao: toDate(merged.dataCelebracao),
          vigenciaInicio: toDate(merged.vigenciaInicio),
          vigenciaFim: toDate(merged.vigenciaFim),
          versao: { increment: 1 },
        },
      });
      if (updated.count === 0) throw this.versionConflict();

      const row = await tx.instrumento.findUniqueOrThrow({ where: { id } });
      const instrumento = toResponse(row);
      const changed = FIELDS.filter((field) => before[field] !== instrumento[field]);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'INSTRUMENT_UPDATED',
          entidade: 'instrumento',
          entidadeId: id,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, instrumento[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return { instrumento, numeroProcessoRepetido: await this.processUsedElsewhere(tx, row) };
    });
  }

  private async processUsedElsewhere(
    tx: Prisma.TransactionClient,
    row: InstrumentRow,
  ): Promise<boolean> {
    const others = await tx.instrumento.count({
      where: { numeroProcesso: row.numeroProcesso, id: { not: row.id } },
    });
    return others > 0;
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'O instrumento foi alterado por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
