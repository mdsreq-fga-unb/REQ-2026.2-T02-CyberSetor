import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import { ApiError } from '@/lib/api';
import type {
  OpenRegistrationInput,
  Registration,
  RegistrationList,
  UpdateRegistrationInput,
} from '@/types/inscricoes';

export function registrationKey(activityId: string) {
  return ['atividades', activityId, 'inscricao'] as const;
}

export function useRegistration(activityId?: string, enabled = true) {
  return useQuery({
    queryKey: activityId ? registrationKey(activityId) : ['inscricao-invalida'],
    queryFn: async (): Promise<Registration | null> => {
      if (!activityId) return null;
      try {
        return await authorizedRequest<Registration>(
          `/activities/${encodeURIComponent(activityId)}/registration`,
        );
      } catch (error) {
        if (error instanceof ApiError && error.code === 'REGISTRATION_NOT_OPENED') {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(activityId && enabled),
    retry(failureCount, error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function registrationListKey(activityId: string, busca = '') {
  return ['atividades', activityId, 'inscritos', busca] as const;
}

/** Inscritos da atividade: só o Núcleo Pedagógico (seção 8.5.1, RNF04). */
export function useRegistrationList(activityId: string | undefined, busca: string, enabled = true) {
  const query = busca.trim();
  return useQuery({
    queryKey: registrationListKey(activityId ?? '', query),
    queryFn: () =>
      authorizedRequest<RegistrationList>(
        `/activities/${encodeURIComponent(activityId!)}/registrations${
          query ? `?busca=${encodeURIComponent(query)}` : ''
        }`,
      ),
    enabled: Boolean(activityId && enabled),
    placeholderData: (previous) => previous,
  });
}

export function useFreshRegistration() {
  return (activityId: string): Promise<Registration> =>
    authorizedRequest<Registration>(`/activities/${encodeURIComponent(activityId)}/registration`);
}

export function useOpenRegistration(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OpenRegistrationInput) =>
      authorizedRequest<Registration>(
        `/activities/${encodeURIComponent(activityId)}/registration`,
        {
          method: 'POST',
          body: data,
        },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: registrationKey(activityId) }),
        // Mais vagas promovem a lista de espera.
        queryClient.invalidateQueries({ queryKey: ['atividades', activityId, 'inscritos'] }),
        // A lista de atividades mostra a situação da inscrição e os inscritos.
        queryClient.invalidateQueries({
          queryKey: ['projetos'],
          predicate: (query) => query.queryKey[2] === 'atividades',
        }),
      ]),
  });
}

export function useUpdateRegistration(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRegistrationInput) =>
      authorizedRequest<Registration>(
        `/activities/${encodeURIComponent(activityId)}/registration`,
        {
          method: 'PATCH',
          body: data,
        },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: registrationKey(activityId) }),
        // Mais vagas promovem a lista de espera.
        queryClient.invalidateQueries({ queryKey: ['atividades', activityId, 'inscritos'] }),
        // A lista de atividades mostra a situação da inscrição e os inscritos.
        queryClient.invalidateQueries({
          queryKey: ['projetos'],
          predicate: (query) => query.queryKey[2] === 'atividades',
        }),
      ]),
  });
}

/** Promoção manual: o Núcleo confirma a vaga de quem está na espera (HU-07c). */
export function useConfirmFromWaitlist(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inscricaoId: string) =>
      authorizedRequest<RegistrationList>(
        `/activities/${encodeURIComponent(activityId)}/registrations/${encodeURIComponent(
          inscricaoId,
        )}/confirmation`,
        { method: 'POST' },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['atividades', activityId, 'inscritos'] }),
        // A lista de atividades mostra os inscritos e a espera.
        queryClient.invalidateQueries({
          queryKey: ['projetos'],
          predicate: (query) => query.queryKey[2] === 'atividades',
        }),
      ]),
  });
}
