import { ageOn, isValidCpf, phoneDigits } from './participant-data';

describe('dados do participante', () => {
  it('maioridade no dia do aniversario e nascido em 29/02', () => {
    expect(ageOn('2008-10-28', '2026-10-28')).toBe(18);
    expect(ageOn('2008-10-29', '2026-10-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-02-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-03-01')).toBe(18);
  });

  it('confere os digitos do CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('telefone sem pontuacao e sem o +55', () => {
    expect(phoneDigits('+55 (61) 99999-8888')).toBe('61999998888');
    expect(phoneDigits('(61) 3333-4444')).toBe('6133334444');
  });
});
