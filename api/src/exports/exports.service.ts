import { Injectable } from '@nestjs/common';
import type { Actor } from '../accounts/accounts.service.js';
import { hhmm } from '../activities/activities.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { toDate } from '../instruments/instruments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ReportPreviewGoalResponse } from '../projects/report-preview.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { isoDate } from '../reports/reports.service.js';
import type { ProjectExportQueryDto } from './exports.dto.js';
import {
  buildProjectExportCsv,
  exportFileName,
  type ExportActivity,
  type ExportGoal,
  type ExportGoalResult,
} from './project-export.csv.js';
import { buildProjectExportXlsx } from './project-export.xlsx.js';

export interface ProjectExportFile {
  fileName: string;
  contentType: string;
  content: Buffer;
}

const CONTENT_TYPES = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;

function decimal(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

function exportGoal(goal: ReportPreviewGoalResponse, resultados: ExportGoalResult[]): ExportGoal {
  return {
    ordem: goal.ordem,
    origem: goal.origem,
    objetivo: goal.objetivo,
    descricao: goal.descricao,
    indicador: goal.indicador,
    modalidadeAfericao: goal.modalidadeAfericao,
    unidade: goal.unidade,
    parametroPlanejado: goal.parametroPlanejado,
    periodoInicio: goal.periodoInicio,
    periodoFim: goal.periodoFim,
    situacao: goal.situacao,
    rascunho: goal.rascunho,
    resultados,
  };
}

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly audit: AuditTrailService,
  ) {}

  /**
   * Planilha com as atividades e a situação das metas do período (RF38). As metas seguem a
   * mesma apuração da prévia do relatório (CA-05a.1). Cada exportação vai para a trilha (CA-13.4).
   */
  async exportProject(
    projectId: string,
    query: ProjectExportQueryDto,
    actor: Actor,
  ): Promise<ProjectExportFile> {
    const geradoEm = new Date();
    const periodo = { from: query.from, to: query.to };
    // Valida o período (INVALID_PERIOD) e o projeto (404) antes de qualquer outra leitura.
    const preview = await this.projects.reportPreview(projectId, periodo);
    const from = toDate(query.from);
    const to = toDate(query.to);

    const metas =
      query.visao === 'CONSOLIDADA'
        ? preview.metas.map((goal) =>
            exportGoal(
              goal,
              goal.resultado
                ? [
                    {
                      dataReferencia: goal.resultado.dataReferencia,
                      valorAlcancado: goal.resultado.valorAlcancado,
                      parametroPlanejado: goal.resultado.parametroPlanejado,
                      percentual: goal.resultado.percentual,
                      alcance: goal.resultado.alcance,
                      registradoEm: goal.resultado.registradoEm,
                    },
                  ]
                : [],
            ),
          )
        : await this.analyticGoals(preview.metas, from, to);

    const atividades = await this.activities(projectId, from, to);

    const formato = query.formato ?? 'csv';
    const data = {
      projeto: { codigo: preview.projeto.codigo, titulo: preview.projeto.titulo },
      periodo,
      visao: query.visao,
      geradoEm,
      metas,
      atividades,
    };
    const content =
      formato === 'xlsx'
        ? await buildProjectExportXlsx(data)
        : Buffer.from(buildProjectExportCsv(data), 'utf8');

    await this.audit.record({
      autorTipo: AutorTipo.USUARIO,
      usuarioId: actor.usuarioId,
      acao: 'PROJECT_DATA_EXPORTED',
      entidade: 'projeto',
      entidadeId: projectId,
      depois: {
        formato: formato.toUpperCase(),
        visao: query.visao,
        periodoInicio: query.from,
        periodoFim: query.to,
        dataCorte: geradoEm.toISOString(),
        metas: metas.length,
        atividades: atividades.length,
      },
      correlationId: actor.correlationId,
    });

    return {
      fileName: exportFileName(preview.projeto.codigo, periodo, query.visao, formato),
      contentType: CONTENT_TYPES[formato],
      content,
    };
  }

  /** Cada resultado registrado no período; meta em rascunho não entra na apuração (RN-02). */
  private async analyticGoals(
    goals: readonly ReportPreviewGoalResponse[],
    from: Date,
    to: Date,
  ): Promise<ExportGoal[]> {
    const apuradas = goals.filter((goal) => !goal.rascunho).map((goal) => goal.id);
    const rows = await this.prisma.resultadoMeta.findMany({
      where: { metaId: { in: apuradas }, dataReferencia: { gte: from, lte: to } },
      orderBy: [{ dataReferencia: 'asc' }, { criadoEm: 'asc' }],
    });

    const byGoal = new Map<string, ExportGoalResult[]>();
    for (const row of rows) {
      const list = byGoal.get(row.metaId) ?? [];
      list.push({
        dataReferencia: isoDate(row.dataReferencia),
        valorAlcancado: decimal(row.valorAlcancado),
        parametroPlanejado: decimal(row.parametroPlanejado),
        percentual: decimal(row.percentual),
        alcance: row.alcance,
        registradoEm: row.criadoEm.toISOString(),
      });
      byGoal.set(row.metaId, list);
    }
    return goals.map((goal) => exportGoal(goal, byGoal.get(goal.id) ?? []));
  }

  private async activities(projetoId: string, from: Date, to: Date): Promise<ExportActivity[]> {
    const rows = await this.prisma.atividade.findMany({
      where: { projetoId, data: { gte: from, lte: to } },
      select: {
        data: true,
        horaInicio: true,
        horaFim: true,
        cargaHorariaMinutos: true,
        titulo: true,
        local: true,
        modalidade: { select: { nome: true } },
        responsavel: { select: { pessoa: { select: { nome: true } } } },
        metas: {
          select: { meta: { select: { ordem: true } } },
          orderBy: { meta: { ordem: 'asc' } },
        },
      },
      // O cadastro desempata atividades com a mesma data, hora e título.
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }, { titulo: 'asc' }, { criadoEm: 'asc' }],
    });
    return rows.map((row) => ({
      data: isoDate(row.data),
      horaInicio: hhmm(row.horaInicio),
      horaFim: hhmm(row.horaFim),
      cargaHorariaMinutos: row.cargaHorariaMinutos,
      titulo: row.titulo,
      modalidade: row.modalidade.nome,
      local: row.local,
      responsavel: row.responsavel.pessoa.nome,
      metas: row.metas.map((link) => link.meta.ordem),
    }));
  }
}
