export type GoalOrigin = 'EDITAL' | 'PROJETO' | 'INSTITUTO';

export type MeasurementMode = 'QUANTITATIVA' | 'QUALITATIVA';

export type CompletionField = 'indicador' | 'formaComprovacao' | 'periodoInicio' | 'periodoFim';

export interface GoalRequirement {
  id: string;
  referencia: string | null;
  descricao: string;
}

export interface Goal {
  id: string;
  versao: number;
  projetoId: string;
  ordem: number;
  origem: GoalOrigin;
  objetivo: string;
  descricao: string;
  indicador: string | null;
  modalidadeAfericao: MeasurementMode | null;
  parametroPlanejado: string | null;
  unidade: string | null;
  periodoInicio: string | null;
  periodoFim: string | null;
  frequenciaApuracao: string | null;
  formaComprovacao: string | null;
  resultadoEsperado: string | null;
  requisitos: GoalRequirement[];
  rascunho: boolean;
  camposFaltantes: CompletionField[];
}

export interface GoalInput {
  origem: GoalOrigin;
  objetivo: string;
  descricao: string;
  requisitoIds: string[];
  indicador: string;
  modalidadeAfericao: MeasurementMode | null;
  parametroPlanejado: string;
  unidade: string;
  periodoInicio: string | null;
  periodoFim: string | null;
  frequenciaApuracao: string;
  formaComprovacao: string;
  resultadoEsperado: string;
}
