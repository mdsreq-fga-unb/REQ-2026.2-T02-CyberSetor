import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type {
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
