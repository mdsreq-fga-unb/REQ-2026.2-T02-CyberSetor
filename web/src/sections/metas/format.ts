import type { CompletionField, GoalOrigin, GoalRequirement, MeasurementMode } from '@/types/metas';

export const GOAL_ORIGINS: Record<GoalOrigin, string> = {
  EDITAL: 'Edital',
  PROJETO: 'Projeto',
  INSTITUTO: 'Instituto',
};

export const MEASUREMENT_MODES: Record<MeasurementMode, string> = {
  QUANTITATIVA: 'Quantitativa',
  QUALITATIVA: 'Qualitativa',
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
