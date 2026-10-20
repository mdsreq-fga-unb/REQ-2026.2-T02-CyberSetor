import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { InstrumentInput, Instrument, SavedInstrument } from '@/types/instrumentos';

export const instrumentsKey = ['instrumentos'] as const;

export function useInstruments() {
  return useQuery({
    queryKey: instrumentsKey,
    queryFn: () => authorizedRequest<Instrument[]>('/instruments'),
  });
}

export function useSaveInstrument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versao, data }: { id?: string; versao?: number; data: InstrumentInput }) =>
      id
        ? authorizedRequest<SavedInstrument>(`/instruments/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: { ...data, versao },
          })
        : authorizedRequest<SavedInstrument>('/instruments', { method: 'POST', body: data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: instrumentsKey }),
  });
}
