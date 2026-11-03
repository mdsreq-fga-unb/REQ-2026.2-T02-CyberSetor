import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import pdfmake from 'pdfmake';
import type { ReportDocument } from './report-document.js';

/** Gerações ao mesmo tempo (RNF13); as demais esperam a vez. */
const MAX_CONCURRENT = 2;

export interface RenderedPdf {
  body: Buffer;
  sha256: string;
}

/** Gera o PDF em processo, sem navegador; só lê as fontes do próprio pacote. */
@Injectable()
export class ReportPdfRenderer {
  private running = 0;
  private readonly queue: (() => void)[] = [];

  constructor() {
    const fontDir = join(
      dirname(createRequire(import.meta.url).resolve('pdfmake/package.json')),
      'fonts',
      'Roboto',
    );
    pdfmake.setFonts({
      Roboto: {
        normal: join(fontDir, 'Roboto-Regular.ttf'),
        bold: join(fontDir, 'Roboto-Medium.ttf'),
        italics: join(fontDir, 'Roboto-Italic.ttf'),
        bolditalics: join(fontDir, 'Roboto-MediumItalic.ttf'),
      },
    });
    // O texto vem de campos preenchidos por usuários: nada de URL nem de arquivo fora das fontes.
    pdfmake.setUrlAccessPolicy(() => false);
    pdfmake.setLocalAccessPolicy((path) => path.startsWith(fontDir));
  }

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
