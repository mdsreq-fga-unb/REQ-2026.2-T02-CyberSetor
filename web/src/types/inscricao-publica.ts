import type { CampoInscricao } from './inscricoes';

export interface PublicActivity {
  titulo: string;
  data: string;
  local: string;
}

export interface PublicForm {
  atividade: PublicActivity;
  aberta: boolean;
  camposMinimos: string[];
  camposAdicionais: CampoInscricao[];
  aviso: { versao: string; texto: string };
}

export interface PublicSubmission {
  nome: string;
  telefone: string;
  dataNascimento: string;
  email?: string;
  cpf?: string;
  bairroRegiao?: string;
  escolaridade?: string;
  versaoAviso: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  responsavelNome?: string;
  responsavelTelefone?: string;
}

export interface SubmittedRegistration {
  situacao: string;
  atividade: PublicActivity;
  inscritoEm: string;
}
