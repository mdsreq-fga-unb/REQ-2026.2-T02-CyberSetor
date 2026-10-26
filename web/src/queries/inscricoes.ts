import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import { ApiError } from '@/lib/api';
import type {
  OpenRegistrationInput,
  Registration,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: registrationKey(activityId) }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: registrationKey(activityId) }),
  });
}
