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

/** Tamanho máximo do documento formal, o mesmo da API (20 MB). */
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export const DOCUMENT_ACCEPT =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function documentKind(contentType: string): string {
  return contentType === 'application/pdf' ? 'PDF' : 'DOCX';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

const DATE_TIME = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function formatDateTime(value: string): string {
  return DATE_TIME.format(new Date(value));
}

/** Conferência antes do envio; a API confere o conteúdo de novo. */
export function documentFileProblem(file: File): string | null {
  if (!/\.(pdf|docx)$/i.test(file.name)) return 'O documento formal precisa ser PDF ou DOCX.';
  if (file.size > MAX_DOCUMENT_BYTES) return 'O arquivo passa de 20 MB.';
  if (file.size === 0) return 'O arquivo está vazio.';
  return null;
}
