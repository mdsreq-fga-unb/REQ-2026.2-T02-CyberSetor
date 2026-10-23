import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Goal } from '@/types/metas';

export function goalsKey(projectId: string) {
  return ['projetos', projectId, 'metas'] as const;
}

function fetchGoals(projectId: string): Promise<Goal[]> {
  return authorizedRequest<Goal[]>(`/projects/${encodeURIComponent(projectId)}/goals`);
}

export function useGoals(projectId: string) {
  return useQuery({ queryKey: goalsKey(projectId), queryFn: () => fetchGoals(projectId) });
}
