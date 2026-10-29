export interface ParticipantActivity {
  id: string;
  titulo: string;
  data: string;
}

export interface ParticipantSummary {
  id: string;
  versao: number;
  nome: string;
  idade: number;
  telefone: string;
  email: string | null;
  inscricoes: number;
  ultimaAtividade: ParticipantActivity | null;
}

export interface ParticipantRegistration {
  id: string;
  situacao: 'CONFIRMADA';
  inscritoEm: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  responsavelNome: string | null;
  responsavelTelefone: string | null;
  atividade: ParticipantActivity;
  projetoId: string;
  instrumentoId: string;
}

export interface Participant {
  id: string;
  versao: number;
  nome: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  email: string | null;
  cpf: string | null;
  bairroRegiao: string | null;
  escolaridade: string | null;
  inscricoes: ParticipantRegistration[];
}

/** Correção a pedido do titular: só os campos alterados, com a justificativa (RF26). */
export interface ParticipantCorrection {
  versao: number;
  justificativa: string;
  nome?: string;
  telefone?: string;
  dataNascimento?: string;
  email?: string | null;
  cpf?: string | null;
  bairroRegiao?: string | null;
  escolaridade?: string | null;
}
