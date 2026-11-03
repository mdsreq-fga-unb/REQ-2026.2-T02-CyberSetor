'use client';

import { FileCheckIcon } from 'lucide-react';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDialogState } from '@/hooks/use-dialog-state';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/br';
import { useReports } from '@/queries/relatorios';
import type { Report } from '@/types/relatorios';
import { ReportPdfDialog } from '../report-pdf-dialog';

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta relatórios emitidos.';
  }
  return 'Não foi possível carregar os relatórios emitidos. Tente de novo.';
}

function periodOf(report: Report): string {
  return `${formatDate(report.periodoInicio)} a ${formatDate(report.periodoFim)}`;
}

function goalsCount(total: number): string {
  return total === 1 ? '1 meta apurada' : `${total} metas apuradas`;
}

function Version({ report }: { report: Report }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      Versão {report.versao}
      {report.relatorioAnteriorId && <Badge variant="secondary">Retificação</Badge>}
    </span>
  );
}

function Issued({ report }: { report: Report }) {
  return (
    <span>
      {report.emitidoPor.nome}, em {formatDateTime(report.criadoEm)}
    </span>
  );
}

function PdfStatus({ report }: { report: Report }) {
  if (!report.pdf) return <span className="text-muted-foreground">Ainda não gerado</span>;
  return (
    <span className="font-mono text-xs" title={report.pdf.sha256}>
      SHA-256 {report.pdf.sha256.slice(0, 12)}…
    </span>
  );
}

/** Versões emitidas do Relatório de Execução do Objeto, com o PDF de cada uma (HU-05b). */
export function ProjectReportsSection({ projectId }: { projectId: string }) {
  const reports = useReports(projectId);
  const pagination = usePagination(reports.data ?? []);
  const pdfDialog = useDialogState<Report>();

  return (
    <section className="flex flex-col gap-3" aria-labelledby="relatorios-emitidos-heading">
      <div>
        <h2 id="relatorios-emitidos-heading" className="text-lg font-semibold">
          Relatórios emitidos
        </h2>
        <p className="text-sm text-muted-foreground">
          Cada versão guarda os números da emissão; o PDF é o mesmo arquivo sempre que for baixado.
        </p>
      </div>

      {reports.error && !reports.data ? (
        <ListError message={loadFailure(reports.error)} />
      ) : reports.data?.length === 0 ? (
        <ListEmpty
          icon={FileCheckIcon}
          title="Nenhum relatório emitido neste projeto"
          description="Depois da emissão, cada versão aparece aqui com o PDF para a prestação de contas."
        />
      ) : (
        <ListCard>
          <Table aria-busy={reports.isPending}>
            <TableCaption className="sr-only">Relatórios emitidos do projeto.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Período
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Versão
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Emissão
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  PDF
                </TableHead>
                <TableHead scope="col" className="w-16 px-4">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.isPending ? (
                <TableSkeleton columns={5} />
              ) : (
                pagination.pageRows.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{periodOf(report)}</span>
                        <span className="text-sm text-muted-foreground">
                          {goalsCount(report.metas.length)}
                        </span>
                        <span className="text-muted-foreground md:hidden">
                          <Version report={report} />
                        </span>
                        <span className="text-muted-foreground md:hidden">
                          <Issued report={report} />
                        </span>
                        <span className="md:hidden">
                          <PdfStatus report={report} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Version report={report} />
                    </TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      <Issued report={report} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <PdfStatus report={report} />
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <RowActionsMenu
                        label={`Ações do relatório de ${periodOf(report)}, versão ${report.versao}`}
                        actions={[{ label: 'Baixar PDF', onSelect: () => pdfDialog.show(report) }]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação dos relatórios emitidos" />
        </ListCard>
      )}

      <ReportPdfDialog
        projectId={projectId}
        report={pdfDialog.open ? (pdfDialog.value ?? null) : null}
        onClose={pdfDialog.close}
      />
    </section>
  );
}
