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
  local: string;
  metas: ActivityMeta[];
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
