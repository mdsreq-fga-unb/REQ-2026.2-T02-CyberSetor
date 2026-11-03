import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve, sep } from 'node:path';
import { Injectable } from '@nestjs/common';
import pdfmake from 'pdfmake';
import type { ReportDocument } from './report-document.js';

/** Gerações ao mesmo tempo (RNF13); as demais esperam a vez. */
const MAX_CONCURRENT = 2;

const FONT_DIR = join(
  dirname(createRequire(import.meta.url).resolve('pdfmake/package.json')),
  'fonts',
  'Roboto',
);

/** Só arquivos dentro da pasta das fontes, depois de resolver `..` e caminhos relativos. */
export function fontAccessAllowed(path: string): boolean {
  return resolve(path).startsWith(FONT_DIR + sep);
}

// O pdfmake é um singleton do módulo: fontes e políticas são configuradas uma vez, no carregamento.
pdfmake.setFonts({
  Roboto: {
    normal: join(FONT_DIR, 'Roboto-Regular.ttf'),
    bold: join(FONT_DIR, 'Roboto-Medium.ttf'),
    italics: join(FONT_DIR, 'Roboto-Italic.ttf'),
    bolditalics: join(FONT_DIR, 'Roboto-MediumItalic.ttf'),
  },
});
// O texto vem de campos preenchidos por usuários: nada de URL nem de arquivo fora das fontes.
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(fontAccessAllowed);

export interface RenderedPdf {
  body: Buffer;
  sha256: string;
}

/** Gera o PDF em processo, sem navegador; só lê as fontes do próprio pacote. */
@Injectable()
export class ReportPdfRenderer {
  private running = 0;
  private readonly queue: (() => void)[] = [];

  async render(document: ReportDocument): Promise<RenderedPdf> {
    await this.acquire();
    try {
      const body = await pdfmake.createPdf(document).getBuffer();
      return { body, sha256: createHash('sha256').update(body).digest('hex') };
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.running < MAX_CONCURRENT) {
      this.running += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) next();
    else this.running -= 1;
  }
}
