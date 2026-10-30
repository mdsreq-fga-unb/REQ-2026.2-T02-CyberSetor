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
  termoCompromisso?: string | null;
  apresentacao?: string | null;
  prazoInscricao?: string | null;
  prazoHora?: string | null;
  contatoWhatsapp?: string | null;
}
