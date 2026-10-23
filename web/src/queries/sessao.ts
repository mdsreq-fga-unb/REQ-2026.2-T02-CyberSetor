import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { authorizedRequest, getSession, subscribeSession } from '@/auth/session';
import type { Perfil } from '@/auth/types';
import type { SectorRef } from '@/types/setores';

export interface CurrentUser {
  usuarioId: string;
  perfil: Perfil;
  setor: SectorRef | null;
}

export function useCurrentUser() {
  const session = useSyncExternalStore(subscribeSession, getSession, () => null);
  return useQuery({
    queryKey: ['sessao', session?.accessToken],
    queryFn: () => authorizedRequest<CurrentUser>('/auth/session'),
  });
}
