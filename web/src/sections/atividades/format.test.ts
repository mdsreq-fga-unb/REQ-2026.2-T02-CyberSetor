import { describe, expect, it } from 'vitest';
import { metaBadgeLabel, metaFullLabel } from './format';

describe('format de atividades', () => {
  it('gera o rotulo de badge para a meta', () => {
    expect(metaBadgeLabel({ id: '1', ordem: 2, objetivo: 'Oficinas' })).toBe('Meta 2');
  });

  it('gera o rotulo completo da meta', () => {
    expect(metaFullLabel({ ordem: 1, objetivo: 'Atender 100 jovens' })).toBe(
      'Meta 1 — Atender 100 jovens',
    );
  });
});
