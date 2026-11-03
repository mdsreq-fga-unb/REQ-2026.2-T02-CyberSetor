import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type {
  ErasureInput,
  ErasurePlan,
  Participant,
  ParticipantCorrection,
  ParticipantSummary,
  RevocationInput,
} from '@/types/participantes';

/** Fichas de participantes: só o Núcleo Pedagógico (seção 8.5.1). */
export function participantsKey(busca = '') {
  return ['participantes', 'lista', busca] as const;
}

export function participantKey(id: string) {
  return ['participantes', 'ficha', id] as const;
}

export function useParticipants(busca: string, enabled = true) {
  const query = busca.trim();
  return useQuery({
    queryKey: participantsKey(query),
    queryFn: () =>
      authorizedRequest<ParticipantSummary[]>(
        query ? `/participants?busca=${encodeURIComponent(query)}` : '/participants',
      ),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useParticipant(id: string | null) {
  return useQuery({
    queryKey: participantKey(id ?? ''),
    queryFn: () => authorizedRequest<Participant>(`/participants/${encodeURIComponent(id!)}`),
    enabled: Boolean(id),
  });
}

export function useRevokeAuthorization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      inscricaoId,
      data,
    }: {
      id: string;
      inscricaoId: string;
      data: RevocationInput;
    }) =>
      authorizedRequest<Participant>(
        `/participants/${encodeURIComponent(id)}/registrations/${encodeURIComponent(inscricaoId)}/revocations`,
        { method: 'POST', body: data },
      ),
    onSuccess: (participant) => {
      queryClient.setQueryData(participantKey(participant.id), participant);
    },
  });
}

export interface DuplicateCheckParticipant {
  id: string;
  nome: string;
  telefoneMascarado: string;
  emailMascarado?: string | null;
  cpfMascarado?: string | null;
  camposDisponiveis: string[];
}

export interface DuplicateCheckResponse {
  existe: boolean;
  participante?: DuplicateCheckParticipant | null;
}

export async function checkParticipantDuplicate(data: {
  cpf?: string;
  email?: string;
}): Promise<DuplicateCheckResponse> {
  return authorizedRequest<DuplicateCheckResponse>('/participants/check-duplicate', {
    method: 'POST',
    body: data,
  });
}

export function useCorrectParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParticipantCorrection }) =>
      authorizedRequest<Participant>(`/participants/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: (participant) => {
      queryClient.setQueryData(participantKey(participant.id), participant);
      return queryClient.invalidateQueries({ queryKey: ['participantes', 'lista'] });
    },
  });
}

/** O que a exclusão ou a anonimização faria, lido de novo a cada abertura do diálogo. */
export function useErasurePlan(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...participantKey(id ?? ''), 'eliminacao'] as const,
    queryFn: () =>
      authorizedRequest<ErasurePlan>(`/participants/${encodeURIComponent(id!)}/erasure`),
    enabled: Boolean(id && enabled),
    staleTime: 0,
  });
}

export function useEraseParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ErasureInput }) =>
      authorizedRequest<ErasurePlan>(`/participants/${encodeURIComponent(id)}/erasure`, {
        method: 'POST',
        body: data,
      }),
    // A ficha, a lista de participantes e as listas de inscritos mudam (a vaga futura se libera).
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['participantes'] }),
        queryClient.invalidateQueries({ queryKey: ['atividades'] }),
        queryClient.invalidateQueries({
          queryKey: ['projetos'],
          predicate: (query) => query.queryKey[2] === 'atividades',
        }),
      ]),
  });
}
