import type { Perfil } from '@/auth/types';
import type { SectorRef } from '@/types/setores';

export interface Account {
  id: string;
  pessoaId: string;
  nome: string;
  emailLogin: string;
  perfil: Perfil;
  ativo: boolean;
  setor: SectorRef | null;
  deveTrocarSenha: boolean;
  bloqueadoAte: string | null;
  ultimoAcessoEm: string | null;
}

export interface NewAccount {
  nome: string;
  emailLogin: string;
  perfil: Perfil;
  setorId?: string;
}

export interface TemporaryPasswordResult {
  conta: Account;
  senhaTemporaria: string;
}

export interface DeactivationResult {
  conta: Account;
  projetosCoordenados: number;
}
