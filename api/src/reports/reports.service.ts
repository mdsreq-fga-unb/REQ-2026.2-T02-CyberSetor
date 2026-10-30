import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import {
  evaluateReportGoals,
  type EvaluatedReportGoal,
  type JustificativaInput,
} from './report-finalization.js';
import type {
  FinalizeReportDto,
  RectifyReportDto,
  ReportGoalItemResponse,
  ReportResponse,
} from './reports.dto.js';

const WITH_DETAILS = {
  emitidoPor: { select: { id: true, pessoa: { select: { nome: true } } } },
  metas: { orderBy: { metaOrdem: 'asc' } },
} satisfies Prisma.RelatorioInclude;

type ReportRow = Prisma.RelatorioGetPayload<{ include: typeof WITH_DETAILS }>;
type ReportGoalRow = ReportRow['metas'][number];
type InstrumentRow = Prisma.InstrumentoGetPayload<object>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function decimal(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

function toDecimalOrNull(value: number | null): Prisma.Decimal | null {
  return value === null ? null : new Prisma.Decimal(value);
}

function toGoalItemResponse(row: ReportGoalRow): ReportGoalItemResponse {
  return {
    id: row.id,
    metaId: row.metaId,
    resultadoMetaId: row.resultadoMetaId,
    metaOrdem: row.metaOrdem,
    metaOrigem: row.metaOrigem,
    metaObjetivo: row.metaObjetivo,
    metaDescricao: row.metaDescricao,
    metaIndicador: row.metaIndicador,
    modalidadeAfericao: row.modalidadeAfericao,
    unidade: row.unidade,
    parametroPlanejado: decimal(row.parametroPlanejado),
    valorAlcancado: decimal(row.valorAlcancado),
    percentual: decimal(row.percentual),
    alcance: row.alcance,
    resultadoDataReferencia: isoDate(row.resultadoDataReferencia),
    resultadoDescricao: row.resultadoDescricao,
    justificativa: row.justificativa,
  };
}

function toResponse(row: ReportRow): ReportResponse {
  return {
    id: row.id,
    projetoId: row.projetoId,
    versao: row.versao,
    periodoInicio: isoDate(row.periodoInicio),
    periodoFim: isoDate(row.periodoFim),
    relatorioAnteriorId: row.relatorioAnteriorId,
    motivoRetificacao: row.motivoRetificacao,
    emitidoPor: {
      id: row.emitidoPor.id,
      nome: row.emitidoPor.pessoa.nome,
    },
    criadoEm: row.criadoEm.toISOString(),
    metas: row.metas.map(toGoalItemResponse),
  };
}

function assertActive(instrument: InstrumentRow): void {
  if (!instrument.ativo) {
    throw new ConflictException({
      code: 'INSTRUMENT_INACTIVE',
      message: 'O instrumento está inativo e não permite emitir nem retificar relatórios.',
    });
  }
}

function snapshotGoalInput(
  item: EvaluatedReportGoal,
): Prisma.RelatorioMetaCreateWithoutRelatorioInput {
  return {
    meta: { connect: { id: item.goal.id } },
    resultadoMeta: { connect: { id: item.resultado.id } },
    metaOrdem: item.goal.ordem,
    metaOrigem: item.goal.origem,
    metaObjetivo: item.goal.objetivo,
    metaDescricao: item.goal.descricao,
    metaIndicador: item.goal.indicador,
    modalidadeAfericao: item.goal.modalidadeAfericao,
    unidade: item.goal.unidade,
    // Usa o planejado congelado no registro do resultado (RF43) para manter consistência com o percentual.
    parametroPlanejado: toDecimalOrNull(item.resultado.parametroPlanejado),
    valorAlcancado: toDecimalOrNull(item.resultado.valorAlcancado),
    percentual: toDecimalOrNull(item.resultado.percentual),
    alcance: item.alcance,
    resultadoDataReferencia: toDate(item.resultado.dataReferencia),
    resultadoDescricao: item.resultado.descricao,
    justificativa: item.justificativa,
  };
}

function auditJustifications(items: readonly EvaluatedReportGoal[]): Prisma.InputJsonArray {
  return items
    .filter((item) => item.justificativa !== null)
    .map((item) => ({ metaId: item.goal.id, justificativa: item.justificativa }));
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly audit: AuditTrailService,
  ) {}

  async list(projectId: string): Promise<ReportResponse[]> {
    const project = await this.prisma.projeto.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    const rows = await this.prisma.relatorio.findMany({
      where: { projetoId: projectId },
      include: WITH_DETAILS,
      orderBy: [{ periodoInicio: 'desc' }, { periodoFim: 'desc' }, { versao: 'desc' }],
    });
    return rows.map(toResponse);
  }

  async finalize(
    projectId: string,
    data: FinalizeReportDto,
    actor: Actor,
  ): Promise<ReportResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const preview = await this.projects.reportPreview(
          projectId,
          { from: data.from, to: data.to },
          tx,
        );
        const instrument = await tx.instrumento.findUniqueOrThrow({
          where: { id: preview.projeto.instrumentoId },
        });
        assertActive(instrument);

        const periodoInicio = toDate(data.from);
        const periodoFim = toDate(data.to);

        const existing = await tx.relatorio.findFirst({
          where: { projetoId: projectId, periodoInicio, periodoFim },
          select: { id: true },
        });
        if (existing) throw this.alreadyFinalizedConflict();

        const metas = this.validateGoalsForEmission(preview.metas, data.justificativas ?? []);

        const row = await tx.relatorio.create({
          data: {
            projetoId: projectId,
            versao: 1,
            periodoInicio,
            periodoFim,
            emitidoPorId: actor.usuarioId,
            metas: {
              create: metas.map(snapshotGoalInput),
            },
          },
          include: WITH_DETAILS,
        });

        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'REPORT_FINALIZED',
            entidade: 'relatorio',
            entidadeId: row.id,
            depois: {
              projetoId: projectId,
              versao: row.versao,
              periodoInicio: data.from,
              periodoFim: data.to,
              justificativas: auditJustifications(metas),
            },
            correlationId: actor.correlationId,
          },
          tx,
        );

        return toResponse(row);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.alreadyFinalizedConflict();
      }
      throw error;
    }
  }

  async rectify(
    projectId: string,
    reportId: string,
    data: RectifyReportDto,
    actor: Actor,
  ): Promise<ReportResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const anterior = await tx.relatorio.findFirst({
          where: { id: reportId, projetoId: projectId },
          include: {
            metas: { orderBy: { metaOrdem: 'asc' } },
            retificacao: { select: { id: true } },
            projeto: { include: { instrumento: true } },
          },
        });
        if (!anterior) throw new NotFoundException('Relatório não encontrado.');
        assertActive(anterior.projeto.instrumento);
        if (anterior.retificacao !== null) throw this.notLatestVersionConflict();

        const from = isoDate(anterior.periodoInicio);
        const to = isoDate(anterior.periodoFim);

        const preview = await this.projects.reportPreview(projectId, { from, to }, tx);
        const inherited = new Map<string, string>();
        for (const item of anterior.metas) {
          if (item.justificativa !== null) {
            inherited.set(item.metaId, item.justificativa);
          }
        }

        const metas = this.validateGoalsForEmission(
          preview.metas,
          data.justificativas ?? [],
          inherited,
        );

        // RNF08: 0 alterações diretas no registro da versão fechada (append-only).
        const row = await tx.relatorio.create({
          data: {
            projetoId: projectId,
            versao: anterior.versao + 1,
            periodoInicio: anterior.periodoInicio,
            periodoFim: anterior.periodoFim,
            relatorioAnteriorId: anterior.id,
            motivoRetificacao: data.motivo,
            emitidoPorId: actor.usuarioId,
            metas: {
              create: metas.map(snapshotGoalInput),
            },
          },
          include: WITH_DETAILS,
        });

        await this.audit.record(
          {
            autorTipo: AutorTipo.USUARIO,
            usuarioId: actor.usuarioId,
            acao: 'REPORT_RECTIFIED',
            entidade: 'relatorio',
            entidadeId: row.id,
            antes: {
              relatorioId: anterior.id,
              versao: anterior.versao,
            },
            depois: {
              relatorioId: row.id,
              versao: row.versao,
              periodoInicio: from,
              periodoFim: to,
              motivoRetificacao: data.motivo,
              justificativas: auditJustifications(metas),
            },
            correlationId: actor.correlationId,
          },
          tx,
        );

        return toResponse(row);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw this.notLatestVersionConflict();
      }
      throw error;
    }
  }

  private validateGoalsForEmission(
    previewMetas: Parameters<typeof evaluateReportGoals>[0],
    justificativas: readonly JustificativaInput[],
    inherited?: ReadonlyMap<string, string>,
  ): EvaluatedReportGoal[] {
    const result = evaluateReportGoals(previewMetas, justificativas, inherited);

    if (result.kind === 'invalid_goal') {
      throw new BadRequestException({
        code: 'INVALID_REPORT_GOAL',
        message:
          'A justificativa referencia uma meta inexistente, de outro projeto ou em rascunho.',
      });
    }

    if (result.kind === 'justification_not_applicable') {
      throw new BadRequestException({
        code: 'JUSTIFICATION_NOT_APPLICABLE',
        message: 'Metas integralmente cumpridas não recebem justificativa de não atingimento.',
      });
    }

    if (result.kind === 'blocked') {
      throw new UnprocessableEntityException({
        code: 'REPORT_FINALIZATION_BLOCKED',
        message:
          'A emissão do relatório foi bloqueada porque há metas sem resultado registrado ou sem justificativa obrigatória.',
        details: { pendencias: result.pendencias },
      });
    }

    return result.metas;
  }

  private alreadyFinalizedConflict(): ConflictException {
    return new ConflictException({
      code: 'REPORT_ALREADY_FINALIZED',
      message: 'O relatório deste período já foi finalizado. Para corrigir, utilize a retificação.',
    });
  }

  private notLatestVersionConflict(): ConflictException {
    return new ConflictException({
      code: 'REPORT_NOT_LATEST_VERSION',
      message: 'Apenas a versão mais recente do relatório pode ser retificada.',
    });
  }
}
