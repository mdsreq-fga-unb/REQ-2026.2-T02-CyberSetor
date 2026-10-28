import {
  ageOn,
  formatCpf,
  formatDate,
  formatDateTime,
  formatPhone,
  isValidCpf,
  phoneDigits,
} from './br';

describe('formatos brasileiros', () => {
  it('telefone formatado enquanto se digita', () => {
    expect(formatPhone('6')).toBe('(6');
    expect(formatPhone('6133')).toBe('(61) 33');
    expect(formatPhone('6133334444')).toBe('(61) 3333-4444');
    expect(formatPhone('61999998888')).toBe('(61) 99999-8888');
  });

  it('telefone sem pontuacao e sem o +55', () => {
    expect(phoneDigits('+55 (61) 99999-8888')).toBe('61999998888');
    expect(phoneDigits('(55) 99999-8888')).toBe('55999998888');
  });

  it('CPF formatado e conferido', () => {
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('maioridade no dia do aniversario e nascido em 29/02', () => {
    expect(ageOn('2008-10-28', '2026-10-28')).toBe(18);
    expect(ageOn('2008-10-29', '2026-10-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-02-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-03-01')).toBe(18);
  });

  it('data sem fuso', () => {
    expect(formatDate('2026-03-15')).toBe('15/03/2026');
    expect(formatDate('2026-03-15T23:30:00.000Z')).toBe('15/03/2026');
  });

  it('data e hora de Brasilia', () => {
    expect(formatDateTime('2026-10-27T13:05:00.000Z')).toBe('27/10/2026, 10:05');
  });
});
