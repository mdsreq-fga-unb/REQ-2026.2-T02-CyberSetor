import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import { ApiError } from '@/lib/api';
import type {
  InstrumentDocument,
  InstrumentInput,
  Instrument,
  SavedInstrument,
} from '@/types/instrumentos';

export const instrumentsKey = ['instrumentos'] as const;

export function instrumentKey(id: string) {
  return [...instrumentsKey, id] as const;
}

function fetchInstruments(): Promise<Instrument[]> {
  return authorizedRequest<Instrument[]>('/instruments');
}

export function useInstruments() {
  return useQuery({ queryKey: instrumentsKey, queryFn: fetchInstruments });
}

export function useInstrument(id: string) {
  return useQuery({
    queryKey: instrumentKey(id),
    queryFn: () => authorizedRequest<Instrument>(`/instruments/${encodeURIComponent(id)}`),
  });
}

export function useFreshInstrument() {
  const queryClient = useQueryClient();
  return async (id: string): Promise<Instrument | null> => {
    const list = await queryClient.fetchQuery({
      queryKey: instrumentsKey,
      queryFn: fetchInstruments,
      staleTime: 0,
    });
    return list.find((item) => item.id === id) ?? null;
  };
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

export function instrumentDocumentKey(id: string) {
  return [...instrumentKey(id), 'documento'] as const;
}

/** O link assinado vale 5 minutos; a consulta se renova antes disso enquanto a página está aberta. */
const DOCUMENT_REFRESH_MS = 4 * 60 * 1000;

export function useInstrumentDocument(id: string) {
  return useQuery({
    queryKey: instrumentDocumentKey(id),
    queryFn: async (): Promise<InstrumentDocument | null> => {
      try {
        return await authorizedRequest<InstrumentDocument>(
          `/instruments/${encodeURIComponent(id)}/document`,
        );
      } catch (error) {
        if (error instanceof ApiError && error.code === 'DOCUMENT_NOT_ATTACHED') return null;
        throw error;
      }
    },
    staleTime: DOCUMENT_REFRESH_MS,
    refetchInterval: DOCUMENT_REFRESH_MS,
  });
}

export function useAttachDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append('arquivo', file);
      return authorizedRequest<InstrumentDocument>(
        `/instruments/${encodeURIComponent(id)}/document`,
        { method: 'PUT', body },
      );
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: instrumentDocumentKey(id) }),
        queryClient.invalidateQueries({ queryKey: instrumentsKey, exact: true }),
      ]),
  });
}
