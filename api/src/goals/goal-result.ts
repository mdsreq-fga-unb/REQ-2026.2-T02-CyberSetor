import { AlcanceMeta } from '../generated/prisma/enums.js';

const DECIMAL = /^\d+([.,]\d{1,2})?$/;

export function plannedNumber(value: string): number | null {
  if (!DECIMAL.test(value)) return null;
  const parsed = Number(value.replace(',', '.'));
  return parsed > 0 ? parsed : null;
}

// RN-14: percentual calculado sobre o planejado, sem teto de 100%.
export function percentOf(reached: number, planned: number): number {
  return Math.round((reached / planned) * 10000) / 100;
}

export function reachOf(percent: number): AlcanceMeta {
  if (percent >= 100) return AlcanceMeta.CUMPRIDA;
  if (percent === 0) return AlcanceMeta.NAO_CUMPRIDA;
  return AlcanceMeta.PARCIALMENTE_CUMPRIDA;
}
