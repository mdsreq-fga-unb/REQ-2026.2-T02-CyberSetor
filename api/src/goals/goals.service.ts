import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  AutorTipo,
  ModalidadeAfericao,
  OrigemMeta,
  Perfil,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { missingFields } from './goal-completion.js';
import { deadlineAlert, todayInBrasilia } from './goal-deadline.js';
import { percentOf, plannedNumber, reachOf } from './goal-result.js';
import type {
  ChangeSituationDto,
  CreateGoalDto,
  EligibleOwnerResponse,
  GoalResponse,
  GoalResultResponse,
  RecordResultDto,
  UpdateGoalDto,
} from './goals.dto.js';

export const ORIGINS_REQUIRING_REQUIREMENT: readonly OrigemMeta[] = [
  OrigemMeta.EDITAL,
  OrigemMeta.PROJETO,
  OrigemMeta.INSTITUTO,
];

export const OWNER_PROFILES = [
  Perfil.PRESIDENCIA_GESTAO,
  Perfil.NUCLEO_PEDAGOGICO,
  Perfil.ADMINISTRATIVO_FINANCEIRO,
];

export const WITH_AUTHOR = {
  registradoPor: { select: { id: true, pessoa: { select: { nome: true } } } },
} satisfies Prisma.ResultadoMetaInclude;

const LATEST_FIRST = [
  { dataReferencia: 'desc' },
  { criadoEm: 'desc' },
] satisfies Prisma.ResultadoMetaOrderByWithRelationInput[];

const WITH_REQUIREMENTS = {
  resultados: { include: WITH_AUTHOR, orderBy: LATEST_FIRST, take: 1 },
  responsavel: { select: { id: true, ativo: true, pessoa: { select: { nome: true } } } },
  setor: { select: { id: true, nome: true, ativo: true } },
  requisitos: {
    select: { requisito: { select: { id: true, referencia: true, descricao: true } } },
    orderBy: [{ requisito: { criadoEm: 'asc' } }, { requisitoId: 'asc' }],
  },
} satisfies Prisma.MetaInclude;

type GoalRow = Prisma.MetaGetPayload<{ include: typeof WITH_REQUIREMENTS }>;
export type ResultRow = Prisma.ResultadoMetaGetPayload<{ include: typeof WITH_AUTHOR }>;
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
  'responsavelId',
  'setorId',
  'requisitoIds',
] as const;

type GoalField = (typeof FIELDS)[number];
type ReferenceField = 'requisitoIds' | 'responsavelId' | 'setorId';
type GoalValues = Pick<GoalResponse, Exclude<GoalField, ReferenceField>> & {
  requisitoIds: string[];
  responsavelId: string | null;
  setorId: string | null;
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

function decimal(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

export function toResult(row: ResultRow): GoalResultResponse {
  return {
    id: row.id,
    dataReferencia: row.dataReferencia.toISOString().slice(0, 10),
    descricao: row.descricao,
    valorAlcancado: decimal(row.valorAlcancado),
    parametroPlanejado: decimal(row.parametroPlanejado),
    percentual: decimal(row.percentual),
    alcance: row.alcance,
    registradoPor: { id: row.registradoPor.id, nome: row.registradoPor.pessoa.nome },
    registradoEm: row.criadoEm.toISOString(),
  };
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
    responsavel: row.responsavel && {
      id: row.responsavel.id,
      nome: row.responsavel.pessoa.nome,
      ativo: row.responsavel.ativo,
    },
    setor: row.setor,
    situacao: row.situacao,
    alertaPrazo: deadlineAlert(periodoFim, row.situacao, todayInBrasilia()),
    resultado: row.resultados[0] ? toResult(row.resultados[0]) : null,
  };
}

function valuesOf(goal: GoalResponse): GoalValues {
  const references: Record<ReferenceField, unknown> = {
    requisitoIds: sortedIds(goal.requisitos.map((requisito) => requisito.id)),
    responsavelId: goal.responsavel?.id ?? null,
    setorId: goal.setor?.id ?? null,
  };
  return Object.fromEntries(
    FIELDS.map((field) => [
      field,
      field in references ? references[field as ReferenceField] : goal[field as keyof GoalResponse],
    ]),
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

function quantitative(values: Pick<GoalValues, 'modalidadeAfericao'>): boolean {
  return values.modalidadeAfericao === ModalidadeAfericao.QUANTITATIVA;
}

function normalizePlanned(values: GoalValues): GoalValues {
  if (!quantitative(values) || values.parametroPlanejado === null) return values;
  const planned = plannedNumber(values.parametroPlanejado);
  if (planned === null) {
    throw new BadRequestException({
      code: 'INVALID_PLANNED_VALUE',
      message:
        'Na meta quantitativa, o parâmetro planejado é um número maior que zero, com até duas casas decimais (por exemplo, 120 ou 12,5).',
    });
  }
  return { ...values, parametroPlanejado: String(planned) };
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
      const values = normalizePlanned(merge(BLANK, data));
      assertPeriod(values, project);
      assertRequirementsPresent(values);
      await this.assertSameInstrument(tx, project.instrumentoId, values.requisitoIds);
      await this.assertOwner(tx, values.responsavelId);
      await this.assertSector(tx, values.setorId);

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
          depois: { projetoId, ordem, situacao: meta.situacao, ...valuesOf(meta) },
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
      const merged = merge(before, changes);
      const next =
        changes.parametroPlanejado !== undefined || changes.modalidadeAfericao !== undefined
          ? normalizePlanned(merged)
          : merged;
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
      if (changed.includes('responsavelId')) await this.assertOwner(tx, next.responsavelId);
      if (changed.includes('setorId')) await this.assertSector(tx, next.setorId);

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

  async changeSituation(
    id: string,
    { versao, situacao, justificativa }: ChangeSituationDto,
    actor: Actor,
    perfil: Perfil,
  ): Promise<GoalResponse> {
    await this.assertMayRespond(id, actor, perfil, 'GOAL_SITUATION');

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.meta.findUniqueOrThrow({
        where: { id },
        include: { ...WITH_REQUIREMENTS, projeto: { include: { instrumento: true } } },
      });
      if (current.versao !== versao) throw this.versionConflict();
      assertActive(current.projeto.instrumento);
      if (current.situacao === situacao) return toResponse(current);
      if (current.situacao === SituacaoMeta.CONCLUIDA && !justificativa) {
        throw new BadRequestException({
          code: 'JUSTIFICATION_REQUIRED',
          message: 'Informe a justificativa para reabrir uma meta concluída.',
        });
      }

      const updated = await tx.meta.updateMany({
        where: { id, versao },
        data: { situacao, versao: { increment: 1 } },
      });
      if (updated.count === 0) throw this.versionConflict();

      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_UPDATED',
          entidade: 'meta',
          entidadeId: id,
          antes: { situacao: current.situacao },
          depois: justificativa ? { situacao, justificativa } : { situacao },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return toResponse(
        await tx.meta.findUniqueOrThrow({ where: { id }, include: WITH_REQUIREMENTS }),
      );
    });
  }

  async listResults(id: string): Promise<GoalResultResponse[]> {
    const goal = await this.prisma.meta.count({ where: { id } });
    if (goal === 0) throw new NotFoundException('Meta não encontrada.');
    const rows = await this.prisma.resultadoMeta.findMany({
      where: { metaId: id },
      include: WITH_AUTHOR,
      orderBy: LATEST_FIRST,
    });
    return rows.map(toResult);
  }

  async recordResult(
    id: string,
    { dataReferencia, descricao, valorAlcancado, alcance }: RecordResultDto,
    actor: Actor,
    perfil: Perfil,
  ): Promise<GoalResultResponse> {
    await this.assertMayRespond(id, actor, perfil, 'GOAL_RESULT');
    const referencia = toDate(dataReferencia);
    if (dataReferencia > todayInBrasilia()) {
      throw new BadRequestException({
        code: 'FUTURE_REFERENCE_DATE',
        message: 'A data de referência do resultado não pode ser futura.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.meta.findUniqueOrThrow({
        where: { id },
        include: { ...WITH_REQUIREMENTS, projeto: { include: { instrumento: true } } },
      });
      assertActive(current.projeto.instrumento);
      const goal = toResponse(current);
      if (goal.rascunho) {
        throw new BadRequestException({
          code: 'GOAL_DRAFT',
          message:
            'Complete a meta antes de registrar o resultado: meta em rascunho não entra na apuração.',
        });
      }

      const planned = quantitative(goal) ? plannedNumber(goal.parametroPlanejado ?? '') : null;
      let reached: { valor: number | null; percentual: number | null; alcance: typeof alcance };
      if (planned !== null) {
        if (valorAlcancado === undefined || alcance !== undefined) {
          throw new BadRequestException({
            code: 'RESULT_VALUE_REQUIRED',
            message:
              'Na meta quantitativa, informe o valor alcançado; a classificação é calculada pelo percentual.',
          });
        }
        const percentual = percentOf(valorAlcancado, planned);
        reached = { valor: valorAlcancado, percentual, alcance: reachOf(percentual) };
      } else {
        if (alcance === undefined || valorAlcancado !== undefined) {
          throw new BadRequestException({
            code: 'RESULT_REACH_REQUIRED',
            message:
              'Na meta qualitativa, informe a classificação do alcance, sem valor alcançado.',
          });
        }
        reached = { valor: null, percentual: null, alcance };
      }

      const row = await tx.resultadoMeta.create({
        data: {
          metaId: id,
          dataReferencia: referencia,
          descricao,
          valorAlcancado: reached.valor,
          parametroPlanejado: planned,
          percentual: reached.percentual,
          alcance: reached.alcance!,
          registradoPorId: actor.usuarioId,
        },
        include: WITH_AUTHOR,
      });
      const result = toResult(row);
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'GOAL_RESULT_RECORDED',
          entidade: 'meta',
          entidadeId: id,
          depois: {
            dataReferencia: result.dataReferencia,
            valorAlcancado: result.valorAlcancado,
            percentual: result.percentual,
            alcance: result.alcance,
          },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return result;
    });
  }

  async eligibleOwners(): Promise<EligibleOwnerResponse[]> {
    const rows = await this.prisma.usuario.findMany({
      where: { ativo: true, perfil: { in: OWNER_PROFILES } },
      select: {
        id: true,
        pessoa: { select: { nome: true, setor: { select: { id: true, nome: true } } } },
      },
      orderBy: { pessoa: { nome: 'asc' } },
    });
    return rows.map((row) => ({ id: row.id, nome: row.pessoa.nome, setor: row.pessoa.setor }));
  }

  private async assertMayRespond(
    id: string,
    actor: Actor,
    perfil: Perfil,
    operacao: 'GOAL_SITUATION' | 'GOAL_RESULT',
  ): Promise<void> {
    const owner = await this.prisma.meta.findUnique({
      where: { id },
      select: { responsavelId: true },
    });
    if (!owner) throw new NotFoundException('Meta não encontrada.');
    if (perfil === Perfil.PRESIDENCIA_GESTAO || owner.responsavelId === actor.usuarioId) return;
    await this.audit.record({
      autorTipo: AutorTipo.USUARIO,
      usuarioId: actor.usuarioId,
      acao: 'ACCESS_DENIED',
      entidade: 'meta',
      entidadeId: id,
      depois: { operacao },
      correlationId: actor.correlationId,
    });
    throw new ForbiddenException({
      code: 'NOT_GOAL_OWNER',
      message:
        operacao === 'GOAL_SITUATION'
          ? 'Só a Presidência e Gestão ou quem responde pela meta muda a situação dela.'
          : 'Só a Presidência e Gestão ou quem responde pela meta registra o resultado dela.',
    });
  }

  private async assertOwner(
    tx: Prisma.TransactionClient,
    responsavelId: string | null,
  ): Promise<void> {
    if (responsavelId === null) return;
    const eligible = await tx.usuario.count({
      where: { id: responsavelId, ativo: true, perfil: { in: OWNER_PROFILES } },
    });
    if (eligible === 0) {
      throw new BadRequestException({
        code: 'INVALID_OWNER',
        message:
          'Escolha quem responde pela meta entre as contas ativas de Presidência e Gestão, Núcleo Pedagógico ou Administrativo-Financeiro.',
      });
    }
  }

  private async assertSector(tx: Prisma.TransactionClient, setorId: string | null): Promise<void> {
    if (setorId === null) return;
    const active = await tx.setor.count({ where: { id: setorId, ativo: true } });
    if (active === 0) {
      throw new BadRequestException({
        code: 'INVALID_SECTOR',
        message: 'Escolha o setor entre os setores ativos.',
      });
    }
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
