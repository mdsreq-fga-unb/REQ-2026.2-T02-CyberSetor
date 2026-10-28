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
