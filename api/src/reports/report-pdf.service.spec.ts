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
  pdfChave: null,
  pdfSha256: null,
  pdfGeradoEm: null,
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
});
