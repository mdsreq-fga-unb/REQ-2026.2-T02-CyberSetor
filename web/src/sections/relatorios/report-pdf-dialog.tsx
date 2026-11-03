'use client';

import { DownloadIcon } from 'lucide-react';
import { useEffect } from 'react';
import { ListError } from '@/components/list/list-states';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/br';
import { useOpenReportPdf } from '@/queries/relatorios';
import type { Report } from '@/types/relatorios';

function failureOf(error: unknown): string {
  if (error instanceof ApiError && (error.status === 503 || error.status === 404)) {
    return error.message;
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não baixa relatórios.';
  }
  return 'Não foi possível preparar o PDF. Tente de novo.';
}

/** Prepara o PDF da versão e entrega o link, com o SHA-256 para conferência (RF37, RNF08). */
export function ReportPdfDialog({
  projectId,
  report,
  onClose,
}: {
  projectId: string;
  report: Report | null;
  onClose: () => void;
}) {
  const openPdf = useOpenReportPdf(projectId);
  const { mutate, reset } = openPdf;
  const reportId = report?.id;

  useEffect(() => {
    if (reportId) mutate(reportId);
    else reset();
  }, [reportId, mutate, reset]);

  const link = openPdf.data;

  return (
    <Dialog open={report !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>PDF do relatório</DialogTitle>
          <DialogDescription>
            {report &&
              `Versão ${report.versao}, de ${formatDate(report.periodoInicio)} a ${formatDate(report.periodoFim)}.`}
          </DialogDescription>
        </DialogHeader>

        {openPdf.isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Preparando o PDF…
          </p>
        )}
        {openPdf.isError && <ListError message={failureOf(openPdf.error)} />}
        {link && (
          <div className="flex flex-col gap-3 text-sm">
            <p>
              {link.nomeArquivo}, gerado em {formatDateTime(link.geradoEm)}. O arquivo é sempre o
              mesmo para esta versão.
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-pdf-sha256" className="font-medium">
                SHA-256 do arquivo
              </label>
              <Input
                id="report-pdf-sha256"
                readOnly
                value={link.sha256}
                className="font-mono text-xs"
                onFocus={(event) => event.currentTarget.select()}
              />
              <p className="text-muted-foreground">
                Quem receber o PDF pode conferir este código para saber que o arquivo não mudou.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {openPdf.isError && reportId && (
            <Button onClick={() => mutate(reportId)}>Tentar de novo</Button>
          )}
          {link && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'default' })}
            >
              <DownloadIcon data-icon="inline-start" />
              Baixar PDF
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
