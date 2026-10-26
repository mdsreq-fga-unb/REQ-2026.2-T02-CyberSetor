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
  codigoPublico: string;
  linkPublico: string;
}

export interface OpenRegistrationInput {
  vagas: number;
  camposAdicionais: CampoInscricao[];
  campoDuplicidade: CampoDuplicidade;
}

export interface UpdateRegistrationInput {
  versao: number;
  aberta?: boolean;
  vagas?: number;
  camposAdicionais?: CampoInscricao[];
  campoDuplicidade?: CampoDuplicidade;
}
