import type { ProjectTimeline, TimelineGoal } from '@/types/prazos';

export type TimelineEvent =
  | { kind: 'marco'; id: string; date: string; title: string }
  | { kind: 'hoje'; id: 'hoje'; date: string }
  | { kind: 'meta'; id: string; date: string; goal: TimelineGoal };

/** No mesmo dia: inícios, hoje, metas e, por último, os fins. */
const RANK = { inicio: 0, hoje: 1, meta: 2, fim: 3 };

interface Ranked {
  rank: number;
  event: TimelineEvent;
}

function milestone(id: string, date: string, title: string, rank: number): Ranked {
  return { rank, event: { kind: 'marco', id, date, title } };
}

export function buildTimeline({ hoje, instrumento, projeto, metas }: ProjectTimeline): {
  events: TimelineEvent[];
  undated: TimelineGoal[];
} {
  const { vigenciaInicio, vigenciaFim } = instrumento;
  const ranked: Ranked[] = [
    milestone('vigencia-inicio', vigenciaInicio, 'Início da vigência do instrumento', RANK.inicio),
    milestone('projeto-inicio', projeto.inicio, 'Início do projeto', RANK.inicio),
    { rank: RANK.hoje, event: { kind: 'hoje', id: 'hoje', date: hoje } },
    milestone('projeto-fim', projeto.fim, 'Fim do projeto', RANK.fim),
    milestone('vigencia-fim', vigenciaFim, 'Fim da vigência do instrumento', RANK.fim),
  ];
  for (const goal of metas) {
    if (goal.periodoFim !== null) {
      const event = { kind: 'meta', id: goal.metaId, date: goal.periodoFim, goal } as const;
      ranked.push({ rank: RANK.meta, event });
    }
  }
  return {
    // A ordenação é estável: no mesmo dia e na mesma posição, vale a ordem acima.
    events: ranked
      .sort((a, b) => a.event.date.localeCompare(b.event.date) || a.rank - b.rank)
      .map(({ event }) => event),
    undated: metas.filter((goal) => goal.periodoFim === null),
  };
}

/** Metas que pedem ação: vencidas, com prazo em até 30 dias ou abertas sem responsável. */
export function attentionGoals(metas: TimelineGoal[]): TimelineGoal[] {
  return metas.filter(
    (goal) => goal.alerta !== null || (goal.situacao !== 'CONCLUIDA' && goal.responsavel === null),
  );
}
