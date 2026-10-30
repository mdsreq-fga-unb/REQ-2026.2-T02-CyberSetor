import { deadlineOf, nowInBrasilia, withinDeadline } from './deadline.js';

describe('prazo da inscricao', () => {
  it('agora em Brasilia vem tres horas atras do UTC', () => {
    expect(nowInBrasilia(new Date('2026-11-05T02:30:00.000Z'))).toBe('2026-11-04 23:30');
  });

  it('sem hora, o prazo vale ate o fim do dia', () => {
    expect(deadlineOf('2026-11-05', null)).toBe('2026-11-05 23:59');
    expect(withinDeadline('2026-11-05', null, new Date('2026-11-06T02:59:00.000Z'))).toBe(true);
    expect(withinDeadline('2026-11-05', null, new Date('2026-11-06T03:00:00.000Z'))).toBe(false);
  });

  it('com hora, encerra depois do minuto informado', () => {
    expect(withinDeadline('2026-11-05', '18:00', new Date('2026-11-05T21:00:00.000Z'))).toBe(true);
    expect(withinDeadline('2026-11-05', '18:00', new Date('2026-11-05T21:01:00.000Z'))).toBe(false);
  });

  it('sem prazo, nao encerra por data', () => {
    expect(withinDeadline(null, null)).toBe(true);
  });
});
