import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { ReportPreview } from '@/types/relatorios';

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
