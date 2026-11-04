export const TIPOS_VERSAO = ['TERMO_ADITIVO', 'APOSTILA', 'OFICIO'] as const;

export type TipoVersao = (typeof TIPOS_VERSAO)[number];

export interface PlanVersionGoal {
  metaId: string;
  ordem: number;
  objetivo: string;
  parametroAntes: string | null;
  parametroDepois: string | null;
  periodoInicioAntes: string | null;
  periodoInicioDepois: string | null;
  periodoFimAntes: string | null;
  periodoFimDepois: string | null;
}

export interface PlanVersion {
  id: string;
  numero: number;
  tipo: TipoVersao;
  dataDocumento: string;
  documentoOrigem: string;
  publicacao: string | null;
  justificativa: string | null;
  vigenciaFimAnterior: string | null;
  vigenciaFimNova: string | null;
  registradoPor: { id: string; nome: string };
  criadoEm: string;
  metas: PlanVersionGoal[];
}

/** Previsto original, reprogramado e realizado de uma meta repactuada (RF44). */
export interface RepactuatedGoal {
  metaId: string;
  ordem: number;
  objetivo: string;
  unidade: string | null;
  previstoOriginal: string | null;
  reprogramado: string | null;
  realizado: number | null;
  realizadoEm: string | null;
}

export interface WorkPlan {
  versoes: PlanVersion[];
  repactuadas: RepactuatedGoal[];
  foraDaVigencia: string[];
}

export interface RepactuatedGoalInput {
  metaId: string;
  versao: number;
  parametroPlanejado?: string;
  periodoFim?: string;
}

export interface PlanVersionInput {
  tipo: TipoVersao;
  dataDocumento: string;
  documentoOrigem: string;
  publicacao?: string;
  justificativa?: string;
  vigenciaFim?: string;
  metas: RepactuatedGoalInput[];
}
