import type {
  CompletionField,
  DeadlineAlert,
  GoalOrigin,
  GoalRequirement,
  GoalSituation,
  MeasurementMode,
} from '@/types/metas';

export const GOAL_ORIGINS: Record<GoalOrigin, string> = {
  EDITAL: 'Edital',
  PROJETO: 'Projeto',
  INSTITUTO: 'Instituto',
};

export const MEASUREMENT_MODES: Record<MeasurementMode, string> = {
  QUANTITATIVA: 'Quantitativa',
  QUALITATIVA: 'Qualitativa',
};

export const SITUATIONS: Record<GoalSituation, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
};

export const SITUATION_ORDER: GoalSituation[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

export const DEADLINE_ALERTS: Record<DeadlineAlert, string> = {
  VENCENDO: 'Prazo em até 30 dias',
  VENCIDA: 'Prazo vencido',
};

const COMPLETION_LABELS: Record<CompletionField, string> = {
  indicador: 'indicador',
  formaComprovacao: 'forma de comprovação',
  periodoInicio: 'início do período',
  periodoFim: 'fim do período',
};

export function missingText(fields: CompletionField[]): string {
  return `Falta: ${fields.map((field) => COMPLETION_LABELS[field]).join(', ')}.`;
}

export function requirementLabel(requirement: GoalRequirement): string {
  return requirement.referencia ?? requirement.descricao;
}
