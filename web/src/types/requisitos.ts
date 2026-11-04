export interface Requirement {
  id: string;
  versao: number;
  instrumentoId: string;
  descricao: string;
  referencia: string | null;
}

export interface RequirementInput {
  descricao: string;
  referencia: string;
}
