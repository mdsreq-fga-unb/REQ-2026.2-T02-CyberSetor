import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Dashboard } from '@/types/painel';

export const dashboardKey = ['painel'] as const;

/** Tela inicial: painel de prazos (HU-02b) e resumo das contas para a administração. */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => authorizedRequest<Dashboard>('/dashboard'),
  });
}
