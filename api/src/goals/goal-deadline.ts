import type { SituacaoMeta } from '../generated/prisma/enums.js';

export const DEADLINE_WARNING_DAYS = 30;

export const DEADLINE_ALERTS = ['VENCENDO', 'VENCIDA'] as const;

export type DeadlineAlert = (typeof DEADLINE_ALERTS)[number];

export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function deadlineAlert(
  periodoFim: string | null,
  situacao: SituacaoMeta,
  today: string,
): DeadlineAlert | null {
  if (periodoFim === null || situacao === 'CONCLUIDA') return null;
  if (periodoFim < today) return 'VENCIDA';
  return periodoFim <= addDays(today, DEADLINE_WARNING_DAYS) ? 'VENCENDO' : null;
}
