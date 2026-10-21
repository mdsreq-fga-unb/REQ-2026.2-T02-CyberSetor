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

export type ParsedMoney = { value: string } | { error: string };

const GROUPED = /^\d{1,3}(\.\d{3})+(,\d+)?$/;
const PLAIN = /^\d+(,\d+)?$/;

export function parseMoney(input: string): ParsedMoney {
  const compact = input.replace(/\s|R\$/g, '');
  if (!GROUPED.test(compact) && !PLAIN.test(compact)) {
    return { error: 'Use o formato 150.000,00: ponto para milhar e vírgula para centavos.' };
  }
  const [integer, cents = ''] = compact.replace(/\./g, '').split(',');
  if (cents.length > 2) return { error: 'Use no máximo duas casas de centavos.' };
  if (integer.replace(/^0+(?=\d)/, '').length > 12) {
    return { error: 'O valor tem no máximo 12 dígitos antes da vírgula.' };
  }
  const value = Number(`${integer}.${cents || '0'}`).toFixed(2);
  if (Number(value) <= 0) return { error: 'Informe um valor maior que zero.' };
  return { value };
}

export function moneyInput(value: string): string {
  return value.replace('.', ',');
}
