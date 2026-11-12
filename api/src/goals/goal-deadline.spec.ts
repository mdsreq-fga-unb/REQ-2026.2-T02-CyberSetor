import { deadlineAlert, todayInBrasilia } from './goal-deadline.js';

describe('alerta de prazo da meta', () => {
  it.each([
    ['2026-10-22', 'PENDENTE', 'VENCENDO'],
    ['2026-11-21', 'EM_ANDAMENTO', 'VENCENDO'],
    ['2026-11-22', 'PENDENTE', null],
    ['2026-10-21', 'PENDENTE', 'VENCIDA'],
    ['2026-10-21', 'CONCLUIDA', null],
    [null, 'PENDENTE', null],
  ] as const)('prazo %s com a meta %s: %s', (periodoFim, situacao, alerta) => {
    expect(deadlineAlert(periodoFim, situacao, '2026-10-22')).toBe(alerta);
  });

  it('o dia de hoje e o de Brasilia, nao o de Greenwich', () => {
    expect(todayInBrasilia(new Date('2026-10-23T02:30:00.000Z'))).toBe('2026-10-22');
    expect(todayInBrasilia(new Date('2026-10-23T03:30:00.000Z'))).toBe('2026-10-23');
  });
});
