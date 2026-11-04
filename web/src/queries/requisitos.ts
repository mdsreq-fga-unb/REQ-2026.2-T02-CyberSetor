import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Requirement, RequirementInput } from '@/types/requisitos';
import { instrumentKey } from './instrumentos';

export function requirementsKey(instrumentId: string) {
  return [...instrumentKey(instrumentId), 'requisitos'] as const;
}

function fetchRequirements(instrumentId: string): Promise<Requirement[]> {
  return authorizedRequest<Requirement[]>(
    `/instruments/${encodeURIComponent(instrumentId)}/requirements`,
  );
}

export function useRequirements(instrumentId: string) {
  return useQuery({
    queryKey: requirementsKey(instrumentId),
    queryFn: () => fetchRequirements(instrumentId),
  });
}

export function useFreshRequirement(instrumentId: string) {
  const queryClient = useQueryClient();
  return async (id: string): Promise<Requirement | null> => {
    const list = await queryClient.fetchQuery({
      queryKey: requirementsKey(instrumentId),
      queryFn: () => fetchRequirements(instrumentId),
      staleTime: 0,
    });
    return list.find((item) => item.id === id) ?? null;
  };
}

export function useSaveRequirement(instrumentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: RequirementInput }) =>
      id
        ? authorizedRequest<Requirement>(`/requirements/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: { ...data, versao },
          })
        : authorizedRequest<Requirement>(
            `/instruments/${encodeURIComponent(instrumentId)}/requirements`,
            { method: 'POST', body: data },
          ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: requirementsKey(instrumentId) }),
  });
}
