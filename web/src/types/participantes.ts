import type { SituacaoInscricao } from './inscricoes';

export const AUTORIZACOES = ['COMUNICADOS', 'IMAGEM'] as const;

export type Autorizacao = (typeof AUTORIZACOES)[number];

export const CANAIS_PEDIDO = ['EMAIL', 'TELEFONE', 'WHATSAPP', 'PRESENCIAL', 'OUTRO'] as const;

export type CanalPedido = (typeof CANAIS_PEDIDO)[number];

/** Revogação pedida pelo titular: data do pedido e canal (CA-07a.6). */
export interface Revocation {
  pedidoEm: string;
  canal: CanalPedido;
}

export interface RevocationInput {
  autorizacao: Autorizacao;
  canal: CanalPedido;
  pedidoEm: string;
}

export interface ParticipantActivity {
  id: string;
  titulo: string;
  data: string;
}

export interface ParticipantSummary {
  id: string;
  versao: number;
  nome: string;
  nomePreferencia: string | null;
  idade: number;
  telefone: string;
  email: string | null;
  inscricoes: number;
  ultimaAtividade: ParticipantActivity | null;
}

export interface ParticipantRegistration {
  id: string;
  situacao: SituacaoInscricao;
  inscritoEm: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  termoAceitoEm: string | null;
  comunicadosRevogacao: Revocation | null;
  imagemRevogacao: Revocation | null;
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
  nomePreferencia: string | null;
  telefone: string;
  dataNascimento: string;
  idade: number;
  email: string | null;
  cpf: string | null;
  bairroRegiao: string | null;
  escolaridade: string | null;
  /** Quando os dados pessoais foram anonimizados (HU-15b); nulo enquanto não foram. */
  anonimizadoEm: string | null;
  inscricoes: ParticipantRegistration[];
}

/** Correção a pedido do titular: só os campos alterados, com a justificativa (RF26). */
export interface ParticipantCorrection {
  versao: number;
  justificativa: string;
  nome?: string;
  nomePreferencia?: string | null;
  telefone?: string;
  dataNascimento?: string;
  email?: string | null;
  cpf?: string | null;
  bairroRegiao?: string | null;
  escolaridade?: string | null;
}

export const MOTIVOS_ELIMINACAO = ['PEDIDO_TITULAR', 'FIM_FINALIDADE'] as const;

export type MotivoEliminacao = (typeof MOTIVOS_ELIMINACAO)[number];

/** Exclusão ou anonimização a pedido do titular ou ao fim da finalidade (HU-15b, RF27). */
export interface ErasureInput {
  versao: number;
  motivo: MotivoEliminacao;
  canal: CanalPedido;
  pedidoEm: string;
}

/** O que o pedido faz com cada classe de dado, com o fundamento (CA-15b.4, RN-07). */
export interface ErasurePlan {
  acao: 'EXCLUIR' | 'ANONIMIZAR';
  excluidos: string[];
  anonimizados: string[];
  preservados: string[];
  inscricoesCanceladas: number;
}
