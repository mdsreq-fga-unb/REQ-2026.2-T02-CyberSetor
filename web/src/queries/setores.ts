import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Sector } from '@/types/setores';

export const sectorsKey = ['setores'] as const;

function fetchSectors(): Promise<Sector[]> {
  return authorizedRequest<Sector[]>('/sectors');
}

export function useSectors(enabled = true) {
  return useQuery({ queryKey: sectorsKey, queryFn: fetchSectors, enabled });
}

export function useFreshSector() {
  const queryClient = useQueryClient();
  return async (id: string): Promise<Sector | null> => {
    const list = await queryClient.fetchQuery({
      queryKey: sectorsKey,
      queryFn: fetchSectors,
      staleTime: 0,
    });
    return list.find((item) => item.id === id) ?? null;
  };
}

function patch(id: string, body: object) {
  return authorizedRequest<Sector>(`/sectors/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
}

export function useSaveSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, nome }: { id?: string; versao?: number; nome: string }) =>
      id
        ? patch(id, { versao, nome })
        : authorizedRequest<Sector>('/sectors', { method: 'POST', body: { nome } }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: sectorsKey }),
  });
}

export function useSetSectorActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sector, ativo }: { sector: Sector; ativo: boolean }) =>
      patch(sector.id, { versao: sector.versao, ativo }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: sectorsKey }),
  });
}
