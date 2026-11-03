import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import type { AuditTrailService } from '../audit/audit-trail.service.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { FileStorage } from '../storage/file-storage.js';
import type { ReportPdfRenderer } from './pdf/report-pdf.renderer.js';
import { ReportPdfService } from './report-pdf.service.js';

const ROW = {
  id: 'relatorio-1',
  projetoId: 'projeto-1',
  versao: 1,
  periodoInicio: new Date('2025-01-01T00:00:00.000Z'),
  periodoFim: new Date('2025-06-30T00:00:00.000Z'),
  motivoRetificacao: null,
  criadoEm: new Date('2025-07-02T17:30:00.000Z'),
  emitidoPorNome: 'Beatriz Gestão',
  projetoCodigo: 'P01',
  projetoTitulo: 'Oficinas Culturais no Setor',
  instrumentoTipo: 'PARCERIA',
  orgaoConcedente: 'Secretaria de Cultura do DF',
  numeroProcesso: '00150-00009999/2025-01',
  pdf: null,
  relatorioAnterior: null,
  metas: [],
};

function service(renderer: Partial<ReportPdfRenderer>, storage: Partial<FileStorage>) {
  const prisma = { relatorio: { findFirst: vi.fn().mockResolvedValue(ROW) } };
  const config = { get: () => 300 } as unknown as ConfigService<EnvironmentVariables, true>;
  return new ReportPdfService(
    prisma as unknown as PrismaService,
    {} as AuditTrailService,
    renderer as ReportPdfRenderer,
    storage as FileStorage,
    config,
  );
}

const ACTOR = { usuarioId: 'usuario-1', correlationId: 'c-1' };

describe('ReportPdfService (CA-05b.2)', () => {
  it('falha do gerador vira 503 com mensagem para tentar de novo, sem gravar arquivo', async () => {
    const put = vi.fn();
    const pdf = service({ render: vi.fn().mockRejectedValue(new Error('fonte')) }, { put });

    const opening = pdf.open('projeto-1', 'relatorio-1', 'http://api', ACTOR);

    await expect(opening).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(opening).rejects.toMatchObject({
      response: { code: 'REPORT_PDF_FAILED' },
    });
    expect(put).not.toHaveBeenCalled();
  });

  it('falha ao guardar o arquivo também vira 503', async () => {
    const render = vi
      .fn()
      .mockResolvedValue({ body: Buffer.from('%PDF-'), sha256: 'a'.repeat(64) });
    const pdf = service({ render }, { put: vi.fn().mockRejectedValue(new Error('S3')) });

    await expect(pdf.open('projeto-1', 'relatorio-1', 'http://api', ACTOR)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('falha ao assinar o link vira 503, e nao 500', async () => {
    const stored = { chave: 'k', sha256: 'a'.repeat(64), geradoEm: new Date() };
    const prisma = {
      relatorio: { findFirst: vi.fn().mockResolvedValue({ ...ROW, pdf: stored }) },
    };
    const config = { get: () => 300 } as unknown as ConfigService<EnvironmentVariables, true>;
    const pdf = new ReportPdfService(
      prisma as unknown as PrismaService,
      {} as AuditTrailService,
      {} as ReportPdfRenderer,
      { signedUrl: vi.fn().mockRejectedValue(new Error('credencial')) } as unknown as FileStorage,
      config,
    );

    await expect(pdf.open('projeto-1', 'relatorio-1', 'http://api', ACTOR)).rejects.toMatchObject({
      response: { code: 'REPORT_PDF_FAILED' },
    });
  });

  it('pedidos ao mesmo tempo esperam a mesma geracao', async () => {
    let finish: (value: { body: Buffer; sha256: string }) => void = () => undefined;
    const render = vi.fn(
      () =>
        new Promise<{ body: Buffer; sha256: string }>((resolve) => {
          finish = resolve;
        }),
    );
    const prisma = {
      relatorio: { findFirst: vi.fn().mockResolvedValue(ROW) },
      $transaction: vi.fn(async (work: (tx: unknown) => Promise<unknown>) =>
        work({ relatorioPdf: { create: vi.fn() } }),
      ),
    };
    const config = { get: () => 300 } as unknown as ConfigService<EnvironmentVariables, true>;
    const pdf = new ReportPdfService(
      prisma as unknown as PrismaService,
      { record: vi.fn() } as unknown as AuditTrailService,
      { render } as unknown as ReportPdfRenderer,
      {
        put: vi.fn(),
        signedUrl: vi.fn().mockResolvedValue('http://api/arquivo'),
      } as unknown as FileStorage,
      config,
    );

    const first = pdf.open('projeto-1', 'relatorio-1', 'http://api', ACTOR);
    const second = pdf.open('projeto-1', 'relatorio-1', 'http://api', ACTOR);
    await vi.waitFor(() => expect(render).toHaveBeenCalled());
    finish({ body: Buffer.from('%PDF-'), sha256: 'b'.repeat(64) });

    const [a, b] = await Promise.all([first, second]);
    expect(render).toHaveBeenCalledTimes(1);
    expect(a.sha256).toBe(b.sha256);
  });
});
