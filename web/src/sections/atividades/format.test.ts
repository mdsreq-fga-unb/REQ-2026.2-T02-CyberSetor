import { describe, expect, it } from 'vitest';
import { metaBadgeLabel, metaFullLabel, registrationStatus } from './format';

describe('format de atividades', () => {
  it('gera o rotulo de badge para a meta', () => {
    expect(metaBadgeLabel({ id: '1', ordem: 2, objetivo: 'Oficinas' })).toBe('Meta 2');
  });

  it('descreve a situacao da inscricao com o total de inscritos', () => {
    expect(registrationStatus(null)).toEqual({ label: 'Inscrição não aberta', tone: 'none' });
    expect(registrationStatus({ aberta: true, vagas: 30, inscritos: 12 })).toEqual({
      label: 'Inscrição aberta · 12 de 30',
      tone: 'open',
    });
    expect(registrationStatus({ aberta: true, vagas: 30, inscritos: 30 })).toEqual({
      label: 'Vagas preenchidas · 30 de 30',
      tone: 'full',
    });
    expect(registrationStatus({ aberta: false, vagas: 30, inscritos: 30 })).toEqual({
      label: 'Inscrição encerrada · 30 de 30',
      tone: 'closed',
    });
  });

  it('gera o rotulo completo da meta', () => {
    expect(metaFullLabel({ ordem: 1, objetivo: 'Atender 100 jovens' })).toBe(
      'Meta 1 — Atender 100 jovens',
    );
  });
});
