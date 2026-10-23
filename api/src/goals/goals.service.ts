import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo, OrigemMeta } from '../generated/prisma/enums.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { missingFields } from './goal-completion.js';
import type { CreateGoalDto, GoalResponse, UpdateGoalDto } from './goals.dto.js';

export const ORIGINS_REQUIRING_REQUIREMENT: readonly OrigemMeta[] = [
  OrigemMeta.EDITAL,
  OrigemMeta.PROJETO,
  OrigemMeta.INSTITUTO,
];

const WITH_REQUIREMENTS = {
  requisitos: {
    select: { requisito: { select: { id: true, referencia: true, descricao: true } } },
    orderBy: [{ requisito: { criadoEm: 'asc' } }, { requisitoId: 'asc' }],
  },
} satisfies Prisma.MetaInclude;

type GoalRow = Prisma.MetaGetPayload<{ include: typeof WITH_REQUIREMENTS }>;
type InstrumentRow = Prisma.InstrumentoGetPayload<object>;

const FIELDS = [
  'origem',
  'objetivo',
  'descricao',
  'indicador',
  'modalidadeAfericao',
  'parametroPlanejado',
  'unidade',
  'periodoInicio',
  'periodoFim',
  'frequenciaApuracao',
  'formaComprovacao',
  'resultadoEsperado',
  'requisitoIds',
] as const;

type GoalField = (typeof FIELDS)[number];
type GoalValues = Pick<GoalResponse, Exclude<GoalField, 'requisitoIds'>> & {
  requisitoIds: string[];
};

const BLANK = Object.fromEntries(
  FIELDS.map((field) => [field, field === 'requisitoIds' ? [] : null]),
) as unknown as GoalValues;

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function brDate(date: Date): string {
  return date.toISOString().slice(0, 10).split('-').reverse().join('/');
}

function sortedIds(ids: string[] | null): string[] {
  return [...new Set(ids ?? [])].sort();
}

function toResponse(row: GoalRow): GoalResponse {
  const periodoInicio = isoDate(row.periodoInicio);
  const periodoFim = isoDate(row.periodoFim);
  const faltantes = missingFields({ ...row, periodoInicio, periodoFim });
  return {
    id: row.id,
    versao: row.versao,
    projetoId: row.projetoId,
    ordem: row.ordem,
    origem: row.origem,
    objetivo: row.objetivo,
    descricao: row.descricao,
    indicador: row.indicador,
    modalidadeAfericao: row.modalidadeAfericao,
    parametroPlanejado: row.parametroPlanejado,
    unidade: row.unidade,
    periodoInicio,
    periodoFim,
    frequenciaApuracao: row.frequenciaApuracao,
    formaComprovacao: row.formaComprovacao,
    resultadoEsperado: row.resultadoEsperado,
    requisitos: row.requisitos.map(({ requisito }) => requisito),
    rascunho: faltantes.length > 0,
    camposFaltantes: faltantes,
  };
}

function valuesOf(goal: GoalResponse): GoalValues {
  const ids = sortedIds(goal.requisitos.map((requisito) => requisito.id));
  return Object.fromEntries(
    FIELDS.map((field) => [field, field === 'requisitoIds' ? ids : goal[field]]),
  ) as GoalValues;
}

function merge(before: GoalValues, changes: Partial<Record<GoalField, unknown>>): GoalValues {
  return Object.fromEntries(
    FIELDS.map((field) => {
      const value = changes[field];
      if (value === undefined) return [field, before[field]];
      if (field === 'requisitoIds') return [field, sortedIds(value as string[] | null)];
      return [field, value === '' ? null : value];
    }),
  ) as GoalValues;
}

function columns(values: GoalValues): Prisma.MetaUncheckedUpdateInput {
  const scalars = FIELDS.filter((field) => field !== 'requisitoIds');
  return {
    ...Object.fromEntries(scalars.map((field) => [field, values[field]])),
    periodoInicio: values.periodoInicio === null ? null : toDate(values.periodoInicio),
    periodoFim: values.periodoFim === null ? null : toDate(values.periodoFim),
  };
}

function assertPeriod(values: GoalValues, project: { inicio: Date; fim: Date }): void {
  const days = [values.periodoInicio, values.periodoFim].flatMap((value) =>
    value === null ? [] : [toDate(value)],
  );
  if (values.periodoInicio && values.periodoFim && values.periodoFim < values.periodoInicio) {
    throw new BadRequestException({
      code: 'INVALID_PERIOD',
      message: 'O fim do período não pode ser anterior ao início.',
    });
  }
  if (days.some((day) => day < project.inicio || day > project.fim)) {
    throw new BadRequestException({
      code: 'OUTSIDE_PROJECT_EXECUTION',
      message: `O período da meta deve ficar dentro da execução do projeto, de ${brDate(project.inicio)} a ${brDate(project.fim)}.`,
    });
  }
}

function assertRequirementsPresent(values: GoalValues): void {
  if (ORIGINS_REQUIRING_REQUIREMENT.includes(values.origem) && values.requisitoIds.length === 0) {
    throw new BadRequestException({
      code: 'GOAL_REQUIREMENT_REQUIRED',
      message: 'Relacione a meta a pelo menos um requisito do instrumento.',
    });
  }
}

function assertActive(instrument: InstrumentRow): void {
  if (!instrument.ativo) {
    throw new ConflictException({
      code: 'INSTRUMENT_INACTIVE',
      message: 'O instrumento está inativo e não recebe nem altera metas.',
    });
  }
}

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(projetoId: string): Promise<GoalResponse[]> {
    await this.project(this.prisma, projetoId);
    const rows = await this.prisma.meta.findMany({
      where: { projetoId },
      include: WITH_REQUIREMENTS,
      orderBy: [{ ordem: 'asc' }, { criadoEm: 'asc' }],
    });
    return rows.map(toResponse);
  }

  async create(projetoId: string, data: CreateGoalDto, actor: Actor): Promise<GoalResponse> {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.project(tx, projetoId);
      assertActive(project.instrumento);
      const values = merge(BLANK, data);
      assertPeriod(values, project);
      assertRequirementsPresent(values);
      await this.assertSameInstrument(tx, project.instrumentoId, values.requisitoIds);

      const last = await tx.meta.aggregate({ where: { projetoId }, _max: { ordem: true } });
      const ordem = (last._max.ordem ?? 0) + 1;
      const row = await tx.meta.create({
        data: {
          ...(columns(values) as Prisma.MetaUncheckedCreateInput),
          projetoId,
          ordem,
          requisitos: { create: values.requisitoIds.map((requisitoId) => ({ requisitoId })) },
        },
        include: WITH_REQUIREMENTS,
      });
      const meta = toResponse(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_CREATED',
          entidade: 'meta',
          entidadeId: row.id,
          depois: { projetoId, ordem, ...valuesOf(meta) },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return meta;
    });
  }

  async update(
    id: string,
    { versao, ...changes }: UpdateGoalDto,
    actor: Actor,
  ): Promise<GoalResponse> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.meta.findUnique({
        where: { id },
        include: { ...WITH_REQUIREMENTS, projeto: { include: { instrumento: true } } },
      });
      if (!current) throw new NotFoundException('Meta não encontrada.');
      if (current.versao !== versao) throw this.versionConflict();
      assertActive(current.projeto.instrumento);

      const before = valuesOf(toResponse(current));
      const next = merge(before, changes);
      const changed = FIELDS.filter(
        (field) => JSON.stringify(next[field]) !== JSON.stringify(before[field]),
      );
      if (changed.length === 0) return toResponse(current);
      if (changed.includes('periodoInicio') || changed.includes('periodoFim')) {
        assertPeriod(next, current.projeto);
      }
      if (changed.includes('origem') || changed.includes('requisitoIds')) {
        assertRequirementsPresent(next);
      }
      if (changed.includes('requisitoIds')) {
        await this.assertSameInstrument(tx, current.projeto.instrumentoId, next.requisitoIds);
      }

      const updated = await tx.meta.updateMany({
        where: { id, versao },
        data: { ...columns(next), versao: { increment: 1 } },
      });
      if (updated.count === 0) throw this.versionConflict();

      if (changed.includes('requisitoIds')) {
        await tx.metaRequisito.deleteMany({
          where: { metaId: id, requisitoId: { notIn: next.requisitoIds } },
        });
        await tx.metaRequisito.createMany({
          data: next.requisitoIds.map((requisitoId) => ({ metaId: id, requisitoId })),
          skipDuplicates: true,
        });
      }

      const meta = toResponse(
        await tx.meta.findUniqueOrThrow({ where: { id }, include: WITH_REQUIREMENTS }),
      );
      const after = valuesOf(meta);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_UPDATED',
          entidade: 'meta',
          entidadeId: id,
          antes: Object.fromEntries(changed.map((field) => [field, before[field]])),
          depois: Object.fromEntries(changed.map((field) => [field, after[field]])),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return meta;
    });
  }

  private async project(client: Prisma.TransactionClient, projetoId: string) {
    const project = await client.projeto.findUnique({
      where: { id: projetoId },
      include: { instrumento: true },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado.');
    return project;
  }

  private async assertSameInstrument(
    tx: Prisma.TransactionClient,
    instrumentoId: string,
    requisitoIds: string[],
  ): Promise<void> {
    const found = await tx.requisitoInstrumento.count({
      where: { id: { in: requisitoIds }, instrumentoId },
    });
    if (found !== requisitoIds.length) {
      throw new BadRequestException({
        code: 'REQUIREMENT_OUTSIDE_INSTRUMENT',
        message: 'Escolha os requisitos entre os do instrumento deste projeto.',
      });
    }
  }

  private versionConflict(): ConflictException {
    return new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'A meta foi alterada por outra pessoa. Recarregue e tente de novo.',
    });
  }
}
