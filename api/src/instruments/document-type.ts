/** Tamanho máximo do documento formal (20 MB, valor inicial a confirmar). */
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export interface DocumentType {
  contentType: string;
  extension: 'pdf' | 'docx';
}

const PDF: DocumentType = { contentType: 'application/pdf', extension: 'pdf' };
const DOCX: DocumentType = {
  contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  extension: 'docx',
};

const ZIP_SIGNATURE = 0x04034b50;

/** Tipo pelo conteúdo, não pela extensão: PDF pela assinatura e DOCX pelo pacote do Word. */
export function detectDocumentType(body: Buffer): DocumentType | null {
  if (body.subarray(0, 5).toString('latin1') === '%PDF-') return PDF;
  if (body.length >= 4 && body.readUInt32LE(0) === ZIP_SIGNATURE) {
    if (
      body.includes('[Content_Types].xml', 0, 'latin1') &&
      body.includes('word/document.xml', 0, 'latin1')
    ) {
      return DOCX;
    }
  }
  return null;
}

/**
 * O multer entrega o nome em latin1; volta para UTF-8, sem caminho, com tamanho limitado e
 * terminado na extensão do tipo conferido pelo conteúdo.
 */
export function documentFileName(original: string, type: DocumentType): string {
  const decoded = Buffer.from(original, 'latin1').toString('utf8');
  const base = (decoded.split(/[\\/]/).pop() ?? '').replace(/[\p{Cc}]/gu, '').trim();
  const stem =
    base
      .replace(/\.(pdf|docx?)$/i, '')
      .trim()
      .slice(0, 190) || 'documento-formal';
  return `${stem}.${type.extension}`;
}
