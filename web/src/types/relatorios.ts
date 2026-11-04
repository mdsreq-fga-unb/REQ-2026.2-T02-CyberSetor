import type {
  GoalOrigin,
  GoalReach,
  GoalResult,
  GoalSituation,
  MeasurementMode,
} from '@/types/metas';

export interface ReportPreviewGoal {
  id: string;
  ordem: number;
  origem: GoalOrigin;
  objetivo: string;
  descricao: string;
  indicador: string | null;
  modalidadeAfericao: MeasurementMode | null;
  parametroPlanejado: string | null;
  unidade: string | null;
  periodoInicio: string | null;
  periodoFim: string | null;
  situacao: GoalSituation;
  rascunho: boolean;
  resultado: GoalResult | null;
  percentual: number | null;
  status: GoalReach | null;
}

export interface ReportPreviewProject {
  id: string;
  codigo: string;
  titulo: string;
  instrumentoId: string;
  inicio: string;
  fim: string;
}

export interface ReportPreviewPeriod {
  from: string;
  to: string;
}

export interface ReportPreview {
  projeto: ReportPreviewProject;
  periodo: ReportPreviewPeriod;
  metas: ReportPreviewGoal[];
}

export type ReportPendenciaMotivo = 'SEM_RESULTADO_REGISTRADO' | 'SEM_JUSTIFICATIVA';

export interface ReportPendencia {
  metaId: string;
  ordem: number;
  descricao: string;
  motivo: ReportPendenciaMotivo;
  alcance: GoalReach | null;
  percentual: number | null;
}

export interface ReportJustificationInput {
  metaId: string;
  texto: string;
}

export interface FinalizeReportInput {
  from: string;
  to: string;
  justificativas?: ReportJustificationInput[];
}

export interface RectifyReportInput {
  motivo: string;
  justificativas?: ReportJustificationInput[];
}

export interface ReportGoalItem {
  id: string;
  metaId: string;
  resultadoMetaId: string;
  metaOrdem: number;
  metaOrigem: GoalOrigin;
  metaObjetivo: string;
  metaDescricao: string;
  metaIndicador: string | null;
  modalidadeAfericao: MeasurementMode | null;
  unidade: string | null;
  parametroPlanejado: number | null;
  valorAlcancado: number | null;
  percentual: number | null;
  alcance: GoalReach;
  resultadoDataReferencia: string;
  resultadoDescricao: string;
  justificativa: string | null;
}

/** PDF guardado da versão; o SHA-256 confere o arquivo recebido. */
export interface ReportPdf {
  sha256: string;
  geradoEm: string;
}

export interface ReportPdfLink extends ReportPdf {
  url: string;
  expiraEm: string;
  nomeArquivo: string;
}

export interface Report {
  id: string;
  projetoId: string;
  versao: number;
  periodoInicio: string;
  periodoFim: string;
  relatorioAnteriorId: string | null;
  motivoRetificacao: string | null;
  emitidoPor: { id: string; nome: string };
  criadoEm: string;
  metas: ReportGoalItem[];
  pdf: ReportPdf | null;
}
