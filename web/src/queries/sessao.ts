import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/auth/session';
import type { Perfil } from '@/auth/types';
import type { SectorRef } from '@/types/setores';

export interface CurrentUser {
  usuarioId: string;
  perfil: Perfil;
  setor: SectorRef | null;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['sessao'],
    queryFn: () => authorizedRequest<CurrentUser>('/auth/session'),
  });
}
