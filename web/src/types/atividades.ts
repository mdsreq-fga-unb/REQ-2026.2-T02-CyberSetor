export interface ActivityModalidade {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface ActivityResponsavel {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface ActivityMeta {
  id: string;
  ordem: number;
  objetivo: string;
}

export interface Activity {
  id: string;
  versao: number;
  projetoId: string;
  modalidade: ActivityModalidade;
  responsavel: ActivityResponsavel;
  titulo: string;
  data: string;
  /** HH:MM; nulos nas atividades cadastradas antes do horário. */
  horaInicio: string | null;
  horaFim: string | null;
  cargaHorariaMinutos: number | null;
  local: string;
  metas: ActivityMeta[];
  /** Nulo enquanto a inscrição não foi aberta. */
  inscricao: ActivityRegistrationStatus | null;
}

export interface ActivityRegistrationStatus {
  aberta: boolean;
  vagas: number;
  inscritos: number;
}

export interface ActivityInput {
  titulo: string;
  modalidadeId: string;
  responsavelId: string;
  data: string;
  local: string;
  metaIds: string[];
}

export interface EligibleResponsible {
  id: string;
  nome: string;
}
