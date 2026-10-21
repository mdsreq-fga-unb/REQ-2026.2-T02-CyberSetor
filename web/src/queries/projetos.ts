import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { EligibleCoordinator, Project, ProjectInput } from '@/types/projetos';
import { instrumentKey } from './instrumentos';

export function projectsKey(instrumentId: string) {
  return [...instrumentKey(instrumentId), 'projetos'] as const;
}

export function useProjects(instrumentId: string) {
  return useQuery({
    queryKey: projectsKey(instrumentId),
    queryFn: () =>
      authorizedRequest<Project[]>(`/instruments/${encodeURIComponent(instrumentId)}/projects`),
  });
}

export function useEligibleCoordinators(enabled: boolean) {
  return useQuery({
    queryKey: ['coordenadores-elegiveis'],
    queryFn: () => authorizedRequest<EligibleCoordinator[]>('/projects/eligible-coordinators'),
    enabled,
  });
}

export function useFreshProject() {
  return (id: string): Promise<Project> =>
    authorizedRequest<Project>(`/projects/${encodeURIComponent(id)}`);
}

export function useSaveProject(instrumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: ProjectInput }) =>
      id
        ? authorizedRequest<Project>(`/projects/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: { ...data, versao },
          })
        : authorizedRequest<Project>(`/instruments/${encodeURIComponent(instrumentId)}/projects`, {
            method: 'POST',
            body: data,
          }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectsKey(instrumentId) }),
  });
}
