import type { InstrumentType } from '@/types/instrumentos';

export const INSTRUMENT_TYPES: Record<InstrumentType, string> = {
  EDITAL: 'Edital',
  EMENDA: 'Emenda parlamentar',
  PARCERIA: 'Parceria',
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoney(value: string): string {
  return BRL.format(Number(value));
}

export function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function parseMoney(input: string): string | null {
  const compact = input.replace(/\s|R\$/g, '');
  const normalized = compact.replace(/\./g, '').replace(',', '.');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized).toFixed(2);
}

export function moneyInput(value: string): string {
  return value.replace('.', ',');
}
