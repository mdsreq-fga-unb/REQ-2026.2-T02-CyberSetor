import type { Perfil } from '@/auth/types';

export interface Account {
  id: string;
  pessoaId: string;
  nome: string;
  emailLogin: string;
  perfil: Perfil;
  ativo: boolean;
  deveTrocarSenha: boolean;
  bloqueadoAte: string | null;
  ultimoAcessoEm: string | null;
}

export interface NewAccount {
  nome: string;
  emailLogin: string;
  perfil: Perfil;
}

export interface TemporaryPasswordResult {
  conta: Account;
  senhaTemporaria: string;
}

export interface DeactivationResult {
  conta: Account;
  projetosCoordenados: number;
}
