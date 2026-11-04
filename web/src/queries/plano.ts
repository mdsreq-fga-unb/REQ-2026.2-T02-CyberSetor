import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { PlanVersion, PlanVersionInput, WorkPlan } from '@/types/plano';
import { instrumentsKey } from './instrumentos';

export function workPlanKey(projectId: string) {
  return ['projetos', projectId, 'plano'] as const;
}

export function useWorkPlan(projectId: string) {
  return useQuery({
    queryKey: workPlanKey(projectId),
    queryFn: () =>
      authorizedRequest<WorkPlan>(`/projects/${encodeURIComponent(projectId)}/plan-versions`),
  });
}

/** Nova versão do plano (HU-14): muda as metas e, no ofício, a vigência do projeto e do instrumento. */
export function useCreatePlanVersion(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanVersionInput) =>
      authorizedRequest<PlanVersion>(`/projects/${encodeURIComponent(projectId)}/plan-versions`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projetos', projectId] }),
        queryClient.invalidateQueries({ queryKey: instrumentsKey }),
      ]),
  });
}
