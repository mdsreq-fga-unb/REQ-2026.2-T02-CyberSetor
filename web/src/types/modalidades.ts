export interface Modality {
  id: string;
  versao: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface ModalityInput {
  nome: string;
  descricao: string;
}
