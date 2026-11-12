import type { InstrumentType } from '@/types/instrumentos';

export const INSTRUMENT_TYPES: Record<InstrumentType, string> = {
  EDITAL: 'Edital',
  EMENDA: 'Emenda parlamentar',
  PARCERIA: 'Parceria',
};

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

/** Conferência antes do envio; a API confere o conteúdo de novo. */
export function documentFileProblem(file: File): string | null {
  if (!/\.(pdf|docx)$/i.test(file.name)) return 'O documento formal precisa ser PDF ou DOCX.';
  if (file.size > MAX_DOCUMENT_BYTES) return 'O arquivo passa de 20 MB.';
  if (file.size === 0) return 'O arquivo está vazio.';
  return null;
}
