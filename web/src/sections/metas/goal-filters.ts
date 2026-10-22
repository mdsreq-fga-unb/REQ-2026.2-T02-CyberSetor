import type { Perfil } from '@/auth/types';
import type { Goal } from '@/types/metas';
import type { SectorRef } from '@/types/setores';

export const GOAL_FILTERS = ['TODAS', 'MINHAS', 'MEU_SETOR', 'PRAZO'] as const;

export type GoalFilter = (typeof GOAL_FILTERS)[number];

export const FILTER_LABELS: Record<GoalFilter, string> = {
  TODAS: 'Todas',
  MINHAS: 'Minhas',
  MEU_SETOR: 'Do meu setor',
  PRAZO: 'Prazo próximo ou vencido',
};

export interface Viewer {
  usuarioId: string;
  perfil: Perfil;
  setor: SectorRef | null;
}

export function filtersFor(viewer: Viewer): GoalFilter[] {
  return GOAL_FILTERS.filter((filter) => filter !== 'MEU_SETOR' || viewer.setor !== null);
}

export function defaultFilter(viewer: Viewer): GoalFilter {
  if (viewer.perfil !== 'NUCLEO_PEDAGOGICO') return 'TODAS';
  return viewer.setor ? 'MEU_SETOR' : 'MINHAS';
}

export function matches(goal: Goal, filter: GoalFilter, viewer: Viewer): boolean {
  switch (filter) {
    case 'MINHAS':
      return goal.responsavel?.id === viewer.usuarioId;
    case 'MEU_SETOR':
      return viewer.setor !== null && goal.setor?.id === viewer.setor.id;
    case 'PRAZO':
      return goal.alertaPrazo !== null;
    default:
      return true;
  }
}
