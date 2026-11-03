import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FILE_STORAGE, type FileStorage } from '../storage/file-storage.js';
import { buildReportDocument, type ReportForPdf } from './pdf/report-document.js';
import { ReportPdfRenderer } from './pdf/report-pdf.renderer.js';
import type { OpenReportPdfResponse } from './reports.dto.js';
import { isoDate, toGoalItemResponse } from './reports.service.js';

const PDF_CONTENT_TYPE = 'application/pdf';

const WITH_PDF_DATA = {
  metas: { orderBy: { metaOrdem: 'asc' } },
  relatorioAnterior: { select: { versao: true } },
} satisfies Prisma.RelatorioInclude;

type ReportPdfRow = Prisma.RelatorioGetPayload<{ include: typeof WITH_PDF_DATA }>;

interface StoredPdf {
  chave: string;
  sha256: string;
  geradoEm: Date;
}

function storedOf(row: {
  pdfChave: string | null;
  pdfSha256: string | null;
  pdfGeradoEm: Date | null;
}): StoredPdf | null {
  if (!row.pdfChave || !row.pdfSha256 || !row.pdfGeradoEm) return null;
  return { chave: row.pdfChave, sha256: row.pdfSha256, geradoEm: row.pdfGeradoEm };
}

function toPdfData(row: ReportPdfRow): ReportForPdf {
  return {
    versao: row.versao,
    versaoAnterior: row.relatorioAnterior?.versao ?? null,
    motivoRetificacao: row.motivoRetificacao,
    periodoInicio: isoDate(row.periodoInicio),
    periodoFim: isoDate(row.periodoFim),
    criadoEm: row.criadoEm,
    emitidoPorNome: row.emitidoPorNome,
    projetoCodigo: row.projetoCodigo,
    projetoTitulo: row.projetoTitulo,
    instrumentoTipo: row.instrumentoTipo,
    orgaoConcedente: row.orgaoConcedente,
    numeroProcesso: row.numeroProcesso,
    metas: row.metas.map(toGoalItemResponse),
  };
}

function fileName(row: ReportPdfRow): string {
  const codigo = row.projetoCodigo.replace(/[^\w-]+/g, '_');
  return `relatorio-${codigo}-${isoDate(row.periodoInicio)}-a-${isoDate(row.periodoFim)}-v${row.versao}.pdf`;
}

function generationFailed(): ServiceUnavailableException {
  return new ServiceUnavailableException({
    code: 'REPORT_PDF_FAILED',
    message: 'Não foi possível gerar o PDF do relatório agora. Tente de novo em instantes.',
  });
}

/**
 * PDF da versão emitida (RF37, CA-05b.1): gerado uma vez a partir da cópia da emissão, guardado no
 * armazenamento e entregue sempre o mesmo arquivo, com o SHA-256 para conferência (RNF08).
 */
@Injectable()
export class ReportPdfService {
  private readonly urlTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
    private readonly renderer: ReportPdfRenderer,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.urlTtlSeconds = config.get('DOCUMENT_URL_TTL_SECONDS', { infer: true });
  }

  async open(
    projectId: string,
    reportId: string,
    baseUrl: string,
    actor: Actor,
  ): Promise<OpenReportPdfResponse> {
    const row = await this.prisma.relatorio.findFirst({
      where: { id: reportId, projetoId: projectId },
      include: WITH_PDF_DATA,
    });
    if (!row) throw new NotFoundException('Relatório não encontrado.');

    const stored = storedOf(row) ?? (await this.generate(row, actor));
    const nomeArquivo = fileName(row);
    const url = await this.storage.signedUrl(
      { key: stored.chave, fileName: nomeArquivo, contentType: PDF_CONTENT_TYPE },
      this.urlTtlSeconds,
      baseUrl,
    );
    return {
      url,
      expiraEm: new Date(Date.now() + this.urlTtlSeconds * 1000),
      nomeArquivo,
      sha256: stored.sha256,
      geradoEm: stored.geradoEm.toISOString(),
    };
  }

  private async generate(row: ReportPdfRow, actor: Actor): Promise<StoredPdf> {
    const chave = `relatorios/${row.projetoId}/${row.id}/${randomUUID()}.pdf`;
    let sha256: string;
    try {
      const pdf = await this.renderer.render(buildReportDocument(toPdfData(row)));
      sha256 = pdf.sha256;
      await this.storage.put(chave, pdf.body, PDF_CONTENT_TYPE);
    } catch {
      throw generationFailed();
    }

    let recorded: StoredPdf;
    try {
      recorded = await this.record(row, { chave, sha256, geradoEm: new Date() }, actor);
    } catch (error) {
      // Sem o registro, o arquivo fica órfão no armazenamento; a falha da remoção não esconde a original.
      await this.storage.delete(chave).catch(() => undefined);
      throw error;
    }
    if (recorded.chave !== chave) await this.storage.delete(chave).catch(() => undefined);
    return recorded;
  }

  /** Grava o primeiro PDF da versão; com dois pedidos ao mesmo tempo, vale o que gravou antes. */
  private record(row: ReportPdfRow, pdf: StoredPdf, actor: Actor): Promise<StoredPdf> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.relatorio.updateMany({
        where: { id: row.id, pdfChave: null },
        data: { pdfChave: pdf.chave, pdfSha256: pdf.sha256, pdfGeradoEm: pdf.geradoEm },
      });
      if (updated.count === 0) {
        const winner = storedOf(
          await tx.relatorio.findUniqueOrThrow({
            where: { id: row.id },
            select: { pdfChave: true, pdfSha256: true, pdfGeradoEm: true },
          }),
        );
        if (winner) return winner;
        throw generationFailed();
      }
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: 'REPORT_PDF_GENERATED',
          entidade: 'relatorio',
          entidadeId: row.id,
          depois: { versao: row.versao, sha256: pdf.sha256 },
          correlationId: actor.correlationId,
        },
        tx,
      );
      return pdf;
    });
  }
}
