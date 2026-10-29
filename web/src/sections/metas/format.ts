import type {
  CompletionField,
  DeadlineAlert,
  GoalOrigin,
  GoalReach,
  GoalResult,
  GoalRequirement,
  GoalSituation,
  MeasurementMode,
} from '@/types/metas';
import { formatNumber } from '@/lib/br';

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

export const REACHES: Record<GoalReach, string> = {
  CUMPRIDA: 'Cumprida',
  PARCIALMENTE_CUMPRIDA: 'Parcialmente cumprida',
  NAO_CUMPRIDA: 'Não cumprida',
};

const COMPLETION_LABELS: Record<CompletionField, string> = {
  indicador: 'indicador',
  parametroPlanejado: 'parâmetro planejado',
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

// RN-14: na meta quantitativa, valor alcançado sobre o planejado; na qualitativa, só o alcance.
export function resultText(result: GoalResult, unit: string | null): string {
  const reach = REACHES[result.alcance];
  if (result.valorAlcancado === null || result.parametroPlanejado === null) return reach;
  const of = `${formatNumber(result.valorAlcancado)} de ${formatNumber(result.parametroPlanejado)}${unit ? ` ${unit}` : ''}`;
  return `${of} (${formatNumber(result.percentual ?? 0)}%) · ${reach}`;
}

export function plannedNumber(value: string | null): number | null {
  if (!value || !/^\d+([.,]\d{1,2})?$/.test(value)) return null;
  const parsed = Number(value.replace(',', '.'));
  return parsed > 0 ? parsed : null;
}

export function reachOf(percent: number): GoalReach {
  if (percent >= 100) return 'CUMPRIDA';
  if (percent === 0) return 'NAO_CUMPRIDA';
  return 'PARCIALMENTE_CUMPRIDA';
}
