import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Activity, ActivityInput, EligibleResponsible } from '@/types/atividades';

export function activitiesKey(projectId: string) {
  return ['projetos', projectId, 'atividades'] as const;
}

export function useActivities(projectId: string) {
  return useQuery({
    queryKey: activitiesKey(projectId),
    queryFn: () =>
      authorizedRequest<Activity[]>(`/projects/${encodeURIComponent(projectId)}/activities`),
  });
}

export function useEligibleResponsibles(enabled: boolean) {
  return useQuery({
    queryKey: ['responsaveis-elegiveis'],
    queryFn: () => authorizedRequest<EligibleResponsible[]>('/activities/eligible-responsibles'),
    enabled,
  });
}

export function useFreshActivity() {
  return (id: string): Promise<Activity> =>
    authorizedRequest<Activity>(`/activities/${encodeURIComponent(id)}`);
}

export function useSaveActivity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: ActivityInput }) =>
      id
        ? authorizedRequest<Activity>(`/activities/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: { ...data, versao },
          })
        : authorizedRequest<Activity>(`/projects/${encodeURIComponent(projectId)}/activities`, {
            method: 'POST',
            body: data,
          }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: activitiesKey(projectId) }),
  });
}
