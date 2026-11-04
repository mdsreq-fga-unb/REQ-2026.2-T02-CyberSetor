import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type {
  FinalizeReportInput,
  RectifyReportInput,
  Report,
  ReportPdfLink,
  ReportPreview,
} from '@/types/relatorios';

export function reportPreviewKey(projectId: string, from?: string, to?: string) {
  return ['report-preview', projectId, from, to] as const;
}

// O campo de data emite anos parciais (0002, 0020...) enquanto a pessoa digita.
const COMPLETE_DATE = /^(19|20)\d{2}-\d{2}-\d{2}$/;

export function useReportPreview(projectId: string, from: string, to: string) {
  const enabled = Boolean(
    projectId && COMPLETE_DATE.test(from) && COMPLETE_DATE.test(to) && from <= to,
  );

  return useQuery({
    queryKey: reportPreviewKey(projectId, from, to),
    queryFn: () =>
      authorizedRequest<ReportPreview>(
        `/projects/${encodeURIComponent(projectId)}/report-preview?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      ),
    enabled,
  });
}

export function reportsKey(projectId: string) {
  return ['reports', projectId] as const;
}

export function useReports(projectId: string, enabled = true) {
  return useQuery({
    queryKey: reportsKey(projectId),
    queryFn: () =>
      authorizedRequest<Report[]>(`/projects/${encodeURIComponent(projectId)}/reports`),
    enabled: Boolean(projectId && enabled),
  });
}

export function useFinalizeReport(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: FinalizeReportInput) =>
      authorizedRequest<Report>(`/projects/${encodeURIComponent(projectId)}/reports/finalize`, {
        method: 'POST',
        body,
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: reportsKey(projectId) }),
        queryClient.invalidateQueries({ queryKey: ['report-preview', projectId] }),
      ]),
  });
}

export function useRectifyReport(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, body }: { reportId: string; body: RectifyReportInput }) =>
      authorizedRequest<Report>(
        `/projects/${encodeURIComponent(projectId)}/reports/${encodeURIComponent(reportId)}/rectify`,
        {
          method: 'POST',
          body,
        },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: reportsKey(projectId) }),
        queryClient.invalidateQueries({ queryKey: ['report-preview', projectId] }),
      ]),
  });
}

/** O link assinado vale 5 minutos; a consulta se renova antes disso enquanto o diálogo está aberto. */
const PDF_LINK_REFRESH_MS = 4 * 60 * 1000;

export function reportPdfKey(projectId: string, reportId: string) {
  return [...reportsKey(projectId), reportId, 'pdf'] as const;
}

/**
 * Link do PDF da versão; a primeira leitura gera e guarda o arquivo, e a linha da lista ganha o
 * hash sem outra leitura da lista.
 */
export function useReportPdf(projectId: string, reportId: string | undefined, enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: reportPdfKey(projectId, reportId ?? ''),
    queryFn: async () => {
      const link = await authorizedRequest<ReportPdfLink>(
        `/projects/${encodeURIComponent(projectId)}/reports/${encodeURIComponent(reportId!)}/pdf`,
      );
      queryClient.setQueryData<Report[]>(reportsKey(projectId), (reports) =>
        reports?.map((report) =>
          report.id === reportId && !report.pdf
            ? { ...report, pdf: { sha256: link.sha256, geradoEm: link.geradoEm } }
            : report,
        ),
      );
      return link;
    },
    enabled: Boolean(reportId && enabled),
    staleTime: PDF_LINK_REFRESH_MS,
    refetchInterval: PDF_LINK_REFRESH_MS,
  });
}
