import { describe, expect, it } from 'vitest';
import type { ProjectTimeline, TimelineGoal } from '@/types/prazos';
import { attentionGoals, buildTimeline } from './timeline';

const GOAL: TimelineGoal = {
  metaId: 'a',
  ordem: 1,
  objetivo: 'Meta',
  periodoFim: '2026-06-30',
  situacao: 'PENDENTE',
  alerta: null,
  responsavel: { id: 'u', nome: 'Ana', ativo: true },
  setor: null,
  rascunho: false,
  foraDaVigencia: false,
};

const TIMELINE: ProjectTimeline = {
  hoje: '2026-06-30',
  instrumento: {
    id: 'i',
    numeroProcesso: '1',
    orgaoConcedente: 'Secretaria',
    vigenciaInicio: '2026-01-01',
    vigenciaFim: '2026-12-31',
    ativo: true,
  },
  projeto: { id: 'p', codigo: 'P01', titulo: 'Projeto', inicio: '2026-01-01', fim: '2026-06-30' },
  pendencias: { metas: 2, vencendo: 0, vencidas: 0, semResponsavel: 0 },
  metas: [GOAL, { ...GOAL, metaId: 'b', ordem: 2, periodoFim: null }],
  requisitos: [],
};

describe('buildTimeline', () => {
  it('ordena por data e, no mesmo dia, inicios, hoje, metas e fins', () => {
    const { events } = buildTimeline(TIMELINE);
    expect(events.map((event) => event.id)).toEqual([
      'vigencia-inicio',
      'projeto-inicio',
      'hoje',
      'a',
      'projeto-fim',
      'vigencia-fim',
    ]);
  });

  it('separa as metas sem prazo', () => {
    expect(buildTimeline(TIMELINE).undated.map((goal) => goal.metaId)).toEqual(['b']);
  });
});

describe('attentionGoals', () => {
  it('traz alerta e meta aberta sem responsavel, nao a concluida nem a sem pendencia', () => {
    const goals: TimelineGoal[] = [
      { ...GOAL, metaId: 'vencida', alerta: 'VENCIDA' },
      { ...GOAL, metaId: 'vencendo', alerta: 'VENCENDO' },
      { ...GOAL, metaId: 'sem-dono', responsavel: null },
      { ...GOAL, metaId: 'concluida', situacao: 'CONCLUIDA', responsavel: null },
      { ...GOAL, metaId: 'em-dia' },
    ];
    expect(attentionGoals(goals).map((goal) => goal.metaId)).toEqual([
      'vencida',
      'vencendo',
      'sem-dono',
    ]);
  });
});
