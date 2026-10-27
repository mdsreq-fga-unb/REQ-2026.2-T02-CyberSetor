import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import type { FileStorage, StoredFile } from './file-storage.js';

interface LinkPayload extends StoredFile {
  exp: number;
}

/** Armazenamento em pasta local, para desenvolvimento e testes; o link é assinado como o do S3. */
export class LocalFileStorage implements FileStorage {
  private readonly root: string;

  constructor(
    root: string,
    private readonly secret: string,
  ) {
    this.root = resolve(root);
  }

  async put(key: string, body: Buffer): Promise<void> {
    const path = this.pathOf(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true });
  }

  signedUrl(file: StoredFile, expiresInSeconds: number, baseUrl: string): Promise<string> {
    const payload: LinkPayload = { ...file, exp: Date.now() + expiresInSeconds * 1000 };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return Promise.resolve(`${baseUrl}/v1/files/${data}.${this.sign(data)}`);
  }

  /** Arquivo do link, ou null se a assinatura não confere ou o prazo passou. */
  async open(token: string): Promise<{ file: StoredFile; body: Buffer } | null> {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expected = Buffer.from(this.sign(data));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as LinkPayload;
    if (payload.exp < Date.now()) return null;
    const body = await readFile(this.pathOf(payload.key)).catch(() => null);
    if (!body) return null;
    return {
      file: { key: payload.key, fileName: payload.fileName, contentType: payload.contentType },
      body,
    };
  }

  private sign(data: string): string {
    return createHmac('sha256', this.secret).update(`files:${data}`).digest('base64url');
  }

  private pathOf(key: string): string {
    const path = resolve(join(this.root, key));
    if (!path.startsWith(this.root + sep)) throw new Error('Chave de arquivo inválida.');
    return path;
  }
}
