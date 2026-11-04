import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Modality, ModalityInput } from '@/types/modalidades';

export const modalitiesKey = ['modalidades'] as const;

function fetchModalities(): Promise<Modality[]> {
  return authorizedRequest<Modality[]>('/modalities');
}

export function useModalities() {
  return useQuery({ queryKey: modalitiesKey, queryFn: fetchModalities });
}

export function useFreshModality() {
  const queryClient = useQueryClient();
  return async (id: string): Promise<Modality | null> => {
    const list = await queryClient.fetchQuery({
      queryKey: modalitiesKey,
      queryFn: fetchModalities,
      staleTime: 0,
    });
    return list.find((item) => item.id === id) ?? null;
  };
}

function patch(id: string, body: object) {
  return authorizedRequest<Modality>(`/modalities/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
}

export function useSaveModality() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: ModalityInput }) =>
      id
        ? patch(id, { ...data, versao })
        : authorizedRequest<Modality>('/modalities', { method: 'POST', body: data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: modalitiesKey }),
  });
}

export function useSetModalityActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ modality, ativo }: { modality: Modality; ativo: boolean }) =>
      patch(modality.id, { versao: modality.versao, ativo }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: modalitiesKey }),
  });
}
