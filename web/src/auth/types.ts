export type Perfil =
  | 'PRESIDENCIA_GESTAO'
  | 'NUCLEO_PEDAGOGICO'
  | 'ADMINISTRATIVO_FINANCEIRO'
  | 'CONCEDENTE_AUDITORIA'
  | 'ADMINISTRACAO_SISTEMA';

export interface Session {
  accessToken: string;
  perfil: Perfil;
  deveTrocarSenha: boolean;
}
