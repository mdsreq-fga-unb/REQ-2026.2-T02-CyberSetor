import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { ReportPreview } from '@/types/relatorios';

export function reportPreviewKey(projectId: string, from?: string, to?: string) {
  return ['report-preview', projectId, from, to] as const;
}

export function useReportPreview(projectId: string, from: string, to: string) {
  const enabled = Boolean(projectId && from && to && from <= to);

  return useQuery({
    queryKey: reportPreviewKey(projectId, from, to),
    queryFn: () =>
      authorizedRequest<ReportPreview>(
        `/projects/${encodeURIComponent(projectId)}/report-preview?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      ),
    enabled,
  });
}
