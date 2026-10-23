import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Goal, GoalInput } from '@/types/metas';

export function goalsKey(projectId: string) {
  return ['projetos', projectId, 'metas'] as const;
}

function fetchGoals(projectId: string): Promise<Goal[]> {
  return authorizedRequest<Goal[]>(`/projects/${encodeURIComponent(projectId)}/goals`);
}

export function useGoals(projectId: string) {
  return useQuery({ queryKey: goalsKey(projectId), queryFn: () => fetchGoals(projectId) });
}

export function useFreshGoal(projectId: string) {
  const queryClient = useQueryClient();
  return async (id: string): Promise<Goal | null> => {
    const list = await queryClient.fetchQuery({
      queryKey: goalsKey(projectId),
      queryFn: () => fetchGoals(projectId),
      staleTime: 0,
    });
    return list.find((item) => item.id === id) ?? null;
  };
}

export function useSaveGoal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: GoalInput }) =>
      id
        ? authorizedRequest<Goal>(`/goals/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: { ...data, versao },
          })
        : authorizedRequest<Goal>(`/projects/${encodeURIComponent(projectId)}/goals`, {
            method: 'POST',
            body: data,
          }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: goalsKey(projectId) }),
  });
}
