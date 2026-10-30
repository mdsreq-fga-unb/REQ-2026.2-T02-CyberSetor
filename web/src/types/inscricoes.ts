import type { CanalPedido } from './participantes';

export const CAMPOS_MINIMOS = ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'] as const;

export type CampoMinimo = (typeof CAMPOS_MINIMOS)[number];

export const CAMPOS_ADICIONAIS = ['EMAIL', 'CPF', 'BAIRRO_REGIAO', 'ESCOLARIDADE'] as const;

export type CampoInscricao = (typeof CAMPOS_ADICIONAIS)[number];

export const CAMPOS_DUPLICIDADE = ['EMAIL', 'CPF'] as const;

export type CampoDuplicidade = (typeof CAMPOS_DUPLICIDADE)[number];

export interface Registration {
  atividadeId: string;
  versao: number;
  aberta: boolean;
  vagas: number;
  camposMinimos: CampoMinimo[];
  camposAdicionais: CampoInscricao[];
  campoDuplicidade: CampoDuplicidade;
  /** Com as vagas preenchidas, novas inscrições entram na lista de espera. */
  listaEspera: boolean;
  /** Com mais vagas, a espera é confirmada pela ordem de chegada. */
  promocaoAutomatica: boolean;
  termoCompromisso: string | null;
  /** Apresentação da atividade na página de inscrição. */
  apresentacao: string | null;
  /** Último dia para se inscrever (AAAA-MM-DD); encerra ao fim do dia ou na hora do prazo. */
  prazoInscricao: string | null;
  /** Hora do prazo (HH:MM), para encerramento decisivo; null = fim do dia. */
  prazoHora: string | null;
  /** WhatsApp do Instituto para dúvidas, só dígitos com DDD. */
  contatoWhatsapp: string | null;
  codigoPublico: string;
  linkPublico: string;
}

export interface OpenRegistrationInput {
  vagas: number;
  camposAdicionais: CampoInscricao[];
  campoDuplicidade: CampoDuplicidade;
  listaEspera?: boolean;
  promocaoAutomatica?: boolean;
  termoCompromisso?: string;
  apresentacao?: string;
  prazoInscricao?: string;
  prazoHora?: string;
  contatoWhatsapp?: string;
}

export interface UpdateRegistrationInput {
  versao: number;
  aberta?: boolean;
  vagas?: number;
  camposAdicionais?: CampoInscricao[];
  campoDuplicidade?: CampoDuplicidade;
  listaEspera?: boolean;
  promocaoAutomatica?: boolean;
  termoCompromisso?: string | null;
  apresentacao?: string | null;
  prazoInscricao?: string | null;
  prazoHora?: string | null;
  contatoWhatsapp?: string | null;
}

export type SituacaoInscricao = 'CONFIRMADA' | 'LISTA_ESPERA' | 'CANCELADA';

/** Pessoa inscrita na atividade, como o Núcleo Pedagógico vê (HU-07c). */
export interface RegisteredPerson {
  id: string;
  participanteId: string;
  nome: string;
  idade: number;
  menor: boolean;
  telefone: string;
  email: string | null;
  situacao: SituacaoInscricao;
  posicaoEspera: number | null;
  inscritoEm: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  responsavelNome: string | null;
  responsavelTelefone: string | null;
  /** Cancelamento ou desistência: data do pedido e canal. */
  cancelamento: { pedidoEm: string; canal: CanalPedido } | null;
}

export interface CancelRegistrationInput {
  canal: CanalPedido;
  pedidoEm: string;
}

export interface RegistrationList {
  vagas: number;
  confirmadas: number;
  emEspera: number;
  canceladas: number;
  inscricoes: RegisteredPerson[];
}
