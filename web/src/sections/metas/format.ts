import type { CompletionField, GoalRequirement } from '@/types/metas';

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
