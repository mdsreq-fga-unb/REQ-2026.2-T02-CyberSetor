import { AlcanceMeta, SituacaoMeta } from '../generated/prisma/enums.js';

export const REQUIREMENT_SITUATIONS = ['ATENDIDO', 'PENDENTE', 'SEM_META'] as const;

export type RequirementSituation = (typeof REQUIREMENT_SITUATIONS)[number];

interface LinkedGoal {
  situacao: SituacaoMeta;
  rascunho: boolean;
  alcance: AlcanceMeta | null;
}

// A meta conta quando está concluída, fora do rascunho (RN-02) e sem resultado que diga o contrário.
function counts({ situacao, rascunho, alcance }: LinkedGoal): boolean {
  return (
    situacao === SituacaoMeta.CONCLUIDA &&
    !rascunho &&
    (alcance === null || alcance === AlcanceMeta.CUMPRIDA)
  );
}

// O requisito é do instrumento e a relação com a meta é N:N (RN-01): valem as metas vinculadas de
// todos os projetos do instrumento.
export function requirementSituation(goals: readonly LinkedGoal[]): RequirementSituation {
  if (goals.length === 0) return 'SEM_META';
  return goals.every(counts) ? 'ATENDIDO' : 'PENDENTE';
}
