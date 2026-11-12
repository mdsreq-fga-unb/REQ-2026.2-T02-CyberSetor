import type { SectorRef } from '@/types/setores';

export type GoalOrigin = 'EDITAL' | 'PROJETO' | 'INSTITUTO';

export type GoalSituation = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export type DeadlineAlert = 'VENCENDO' | 'VENCIDA';

export interface GoalOwner {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface GoalSector {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface EligibleOwner {
  id: string;
  nome: string;
  setor: SectorRef | null;
}

export type MeasurementMode = 'QUANTITATIVA' | 'QUALITATIVA';

export type CompletionField =
  'indicador' | 'parametroPlanejado' | 'formaComprovacao' | 'periodoInicio' | 'periodoFim';

export type GoalReach = 'CUMPRIDA' | 'PARCIALMENTE_CUMPRIDA' | 'NAO_CUMPRIDA';

export interface GoalResult {
  id: string;
  dataReferencia: string;
  descricao: string;
  valorAlcancado: number | null;
  parametroPlanejado: number | null;
  percentual: number | null;
  alcance: GoalReach;
  registradoPor: { id: string; nome: string };
  registradoEm: string;
}

export interface GoalResultInput {
  dataReferencia: string;
  descricao: string;
  valorAlcancado?: number;
  alcance?: GoalReach;
}

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
  responsavel: GoalOwner | null;
  setor: GoalSector | null;
  situacao: GoalSituation;
  alertaPrazo: DeadlineAlert | null;
  resultado: GoalResult | null;
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
  responsavelId: string | null;
  setorId: string | null;
}
