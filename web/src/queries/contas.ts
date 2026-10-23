import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Perfil } from '@/auth/types';
import type {
  Account,
  DeactivationResult,
  NewAccount,
  TemporaryPasswordResult,
} from '@/types/contas';

export const accountsKey = ['contas'] as const;

function accountPath(id: string, action: string): string {
  return `/accounts/${encodeURIComponent(id)}/${action}`;
}

export function useAccounts(enabled = true) {
  return useQuery({
    queryKey: accountsKey,
    queryFn: () => authorizedRequest<Account[]>('/accounts'),
    enabled,
  });
}

function useAccountMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useCreateAccount() {
  return useAccountMutation((data: NewAccount) =>
    authorizedRequest<TemporaryPasswordResult>('/accounts', { method: 'POST', body: data }),
  );
}

export function useChangeProfile() {
  return useAccountMutation(({ id, perfil }: { id: string; perfil: Perfil }) =>
    authorizedRequest<Account>(accountPath(id, 'profile'), { method: 'PATCH', body: { perfil } }),
  );
}

export function useChangeSector() {
  return useAccountMutation(({ id, setorId }: { id: string; setorId: string | null }) =>
    authorizedRequest<Account>(accountPath(id, 'sector'), { method: 'PATCH', body: { setorId } }),
  );
}

export function useDeactivateAccount() {
  return useAccountMutation((id: string) =>
    authorizedRequest<DeactivationResult>(accountPath(id, 'deactivate'), { method: 'POST' }),
  );
}

export function useReactivateAccount() {
  return useAccountMutation((id: string) =>
    authorizedRequest<Account>(accountPath(id, 'reactivate'), { method: 'POST' }),
  );
}

export function useResetPassword() {
  return useAccountMutation((id: string) =>
    authorizedRequest<TemporaryPasswordResult>(accountPath(id, 'password-reset'), {
      method: 'POST',
    }),
  );
}
