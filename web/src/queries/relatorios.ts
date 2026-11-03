import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { FinalizeReportInput, Report, ReportPreview } from '@/types/relatorios';

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
