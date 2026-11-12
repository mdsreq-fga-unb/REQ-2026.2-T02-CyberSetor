import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { ProjectTimeline } from '@/types/prazos';
import { goalsKey } from './metas';

// Dentro da chave das metas: salvar uma meta atualiza a linha do tempo junto.
export function projectTimelineKey(projectId: string) {
  return [...goalsKey(projectId), 'prazos'] as const;
}

/** Painel e linha do tempo do projeto (HU-02b). */
export function useProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: projectTimelineKey(projectId),
    queryFn: () =>
      authorizedRequest<ProjectTimeline>(`/projects/${encodeURIComponent(projectId)}/timeline`),
    // Metas mudam nas outras abas: a linha do tempo recarrega a cada visita.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
