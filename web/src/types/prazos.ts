import type { DeadlineAlert, GoalReach, GoalSituation } from '@/types/metas';

export type RequirementSituation = 'ATENDIDO' | 'PENDENTE' | 'SEM_META';

export interface TimelineGoal {
  metaId: string;
  ordem: number;
  objetivo: string;
  periodoFim: string | null;
  situacao: GoalSituation;
  alerta: DeadlineAlert | null;
  responsavel: { id: string; nome: string; ativo: boolean } | null;
  setor: { id: string; nome: string; ativo: boolean } | null;
  rascunho: boolean;
  foraDaVigencia: boolean;
}

export interface TimelineRequirement {
  id: string;
  descricao: string;
  referencia: string | null;
  situacao: RequirementSituation;
  metas: {
    metaId: string;
    ordem: number;
    objetivo: string;
    situacao: GoalSituation;
    rascunho: boolean;
    alcance: GoalReach | null;
    projetoId: string;
    projetoCodigo: string;
  }[];
}

export interface ProjectTimeline {
  hoje: string;
  instrumento: {
    id: string;
    numeroProcesso: string;
    orgaoConcedente: string;
    vigenciaInicio: string;
    vigenciaFim: string;
    ativo: boolean;
  };
  projeto: { id: string; codigo: string; titulo: string; inicio: string; fim: string };
  pendencias: { metas: number; vencendo: number; vencidas: number; semResponsavel: number };
  metas: TimelineGoal[];
  requisitos: TimelineRequirement[];
}
