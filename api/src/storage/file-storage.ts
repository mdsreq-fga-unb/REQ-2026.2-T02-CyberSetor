export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface StoredFile {
  key: string;
  fileName: string;
  contentType: string;
}

export interface FileStorage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Remove o arquivo; usado só para desfazer um envio cujo registro não foi gravado. */
  delete(key: string): Promise<void>;
  /** Endereço de curta duração para abrir o arquivo; o armazenamento nunca é público. */
  signedUrl(file: StoredFile, expiresInSeconds: number, baseUrl: string): Promise<string>;
}

export function contentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
