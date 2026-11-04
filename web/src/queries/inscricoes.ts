import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import { ApiError } from '@/lib/api';
import type {
  AssistedRegistrationResponse,
  CancelRegistrationInput,
  CreateAssistedRegistrationInput,
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

/** Prefixo das listas de inscritos da atividade, com qualquer busca. */
export function registrationListsKey(activityId: string) {
  return ['atividades', activityId, 'inscritos'] as const;
}

export function registrationListKey(activityId: string, busca = '') {
  return [...registrationListsKey(activityId), busca] as const;
}

/** A lista de atividades mostra a situação da inscrição, os inscritos e a espera. */
const PROJECT_ACTIVITIES = {
  queryKey: ['projetos'],
  predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey[2] === 'atividades',
};

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
    // A lista anterior fica na tela só durante a troca da busca; outra atividade carrega do zero.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === activityId ? previous : undefined,
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
        // Mais vagas promovem a lista de espera, e a ficha do participante mostra a situação.
        queryClient.invalidateQueries({ queryKey: registrationListsKey(activityId) }),
        queryClient.invalidateQueries({ queryKey: ['participantes'] }),
        queryClient.invalidateQueries(PROJECT_ACTIVITIES),
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
        // Mais vagas promovem a lista de espera, e a ficha do participante mostra a situação.
        queryClient.invalidateQueries({ queryKey: registrationListsKey(activityId) }),
        queryClient.invalidateQueries({ queryKey: ['participantes'] }),
        queryClient.invalidateQueries(PROJECT_ACTIVITIES),
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
    onSuccess: (list) => refreshAfterChange(queryClient, activityId, list),
  });
}

/** Cancelamento ou desistência registrado pelo Núcleo; a vaga liberada anda a espera. */
export function useCancelRegistration(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inscricaoId, data }: { inscricaoId: string; data: CancelRegistrationInput }) =>
      authorizedRequest<RegistrationList>(
        `/activities/${encodeURIComponent(activityId)}/registrations/${encodeURIComponent(
          inscricaoId,
        )}/cancellation`,
        { method: 'POST', body: data },
      ),
    onSuccess: (list) => refreshAfterChange(queryClient, activityId, list),
  });
}

/**
 * Depois de confirmar ou cancelar, a resposta já é a lista completa: ela entra no cache sem busca, e
 * só as listas com busca, a ficha do participante e as atividades do projeto são relidas.
 */
function refreshAfterChange(
  queryClient: QueryClient,
  activityId: string,
  list: RegistrationList,
): Promise<unknown> {
  queryClient.setQueryData(registrationListKey(activityId), list);
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: registrationListsKey(activityId),
      predicate: (query) => query.queryKey[3] !== '',
    }),
    queryClient.invalidateQueries({ queryKey: ['participantes'] }),
    queryClient.invalidateQueries(PROJECT_ACTIVITIES),
  ]);
}

/** Inscrição presencial registrada pelo Núcleo (HU-08). */
export function useCreateAssistedRegistration(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssistedRegistrationInput) =>
      authorizedRequest<AssistedRegistrationResponse>(
        `/activities/${encodeURIComponent(activityId)}/registration/assisted`,
        {
          method: 'POST',
          body: data,
        },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: registrationListsKey(activityId) }),
        queryClient.invalidateQueries({ queryKey: ['participantes'] }),
        queryClient.invalidateQueries(PROJECT_ACTIVITIES),
      ]),
  });
}
