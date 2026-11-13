'use client';

import { DownloadIcon, FileCheckIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { REPORT_READERS } from '@/auth/profiles';
import type { Perfil } from '@/auth/types';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu, type RowAction } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { useDialogState } from '@/hooks/use-dialog-state';
import { ApiError } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/br';
import { useReports } from '@/queries/relatorios';
import type { Report } from '@/types/relatorios';
import { ProjectExportDialog } from '../project-export-dialog';
import { ReportPdfDialog } from '../report-pdf-dialog';
import { ReportRectifyDialog } from '../report-rectify-dialog';

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
  const reason = report.motivoRetificacao?.trim();
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2">
        Versão {report.versao}
        {report.relatorioAnteriorId && (
          <Badge variant="secondary" title={reason || undefined}>
            Retificação
          </Badge>
        )}
      </span>
      {reason && (
        <span className="text-sm text-muted-foreground wrap-break-word">Motivo: {reason}</span>
      )}
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
export function ProjectReportsSection({
  projectId,
  instrumentActive = true,
  defaultFrom = '',
  defaultTo = '',
}: {
  projectId: string;
  instrumentActive?: boolean;
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const { session } = useSession();
  const reports = useReports(projectId);
  const pagination = usePagination(reports.data);
  const pdfDialog = useDialogState<Report>();
  const rectifyDialog = useDialogState<Report>();
  const [exportOpen, setExportOpen] = useState(false);

  const canRectify = session?.perfil === 'PRESIDENCIA_GESTAO' && instrumentActive;
  const canExport = session !== null && REPORT_READERS.includes(session.perfil as Perfil);

  const supersededIds = useMemo(() => {
    const data = reports.data ?? [];
    const set = new Set<string>();
    for (const item of data) {
      if (item.relatorioAnteriorId) set.add(item.relatorioAnteriorId);
      for (const other of data) {
        if (
          other.id !== item.id &&
          other.periodoInicio === item.periodoInicio &&
          other.periodoFim === item.periodoFim &&
          other.versao > item.versao
        ) {
          set.add(item.id);
        }
      }
    }
    return set;
  }, [reports.data]);

  const latestReport =
    reports.data?.find((item) => !supersededIds.has(item.id)) ?? reports.data?.[0];

  function actionsFor(report: Report): RowAction[] {
    const actions: RowAction[] = [{ label: 'Baixar PDF', onSelect: () => pdfDialog.show(report) }];
    if (canRectify && !supersededIds.has(report.id)) {
      actions.push({
        label: 'Retificar relatório',
        onSelect: () => rectifyDialog.show(report),
      });
    }
    return actions;
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="relatorios-emitidos-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="relatorios-emitidos-heading" className="text-lg font-semibold">
            Relatórios emitidos
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada versão guarda os números da emissão; o PDF é o mesmo arquivo sempre que for
            baixado.
          </p>
        </div>
        {canExport && (
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <DownloadIcon data-icon="inline-start" />
            Exportar planilha
          </Button>
        )}
      </div>

      {reports.error && !reports.data ? (
        <div className="flex flex-col gap-3">
          <ListError message={loadFailure(reports.error)} />
          <Button variant="outline" className="self-start" onClick={() => void reports.refetch()}>
            Tentar de novo
          </Button>
        </div>
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
                    <TableCell className="hidden whitespace-normal md:table-cell">
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
                        actions={actionsFor(report)}
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
        open={pdfDialog.open}
        report={pdfDialog.value}
        onClose={pdfDialog.close}
      />
      <ReportRectifyDialog
        projectId={projectId}
        open={rectifyDialog.open}
        report={rectifyDialog.value}
        onClose={rectifyDialog.close}
        onRectified={(updated) =>
          toast.add({
            type: 'success',
            title: `Relatório retificado (versão ${updated.versao})`,
            description: `Período de ${formatDate(updated.periodoInicio)} a ${formatDate(updated.periodoFim)} emitido preservando a versão anterior.`,
          })
        }
      />
      <ProjectExportDialog
        projectId={projectId}
        open={exportOpen}
        defaultFrom={latestReport?.periodoInicio ?? defaultFrom}
        defaultTo={latestReport?.periodoFim ?? defaultTo}
        onClose={() => setExportOpen(false)}
        onExported={(fileName) =>
          toast.add({
            type: 'success',
            title: 'Planilha exportada',
            description: `Arquivo ${fileName} baixado.`,
          })
        }
      />
    </section>
  );
}
