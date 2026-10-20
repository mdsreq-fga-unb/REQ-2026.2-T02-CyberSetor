import { formatDate, moneyInput, parseMoney } from './format';

describe('valor e data do instrumento', () => {
  it.each([
    ['150.000,50', '150000.50'],
    ['150000', '150000.00'],
    ['R$ 1.234,5', '1234.50'],
    ['150.000', '150000.00'],
    ['1.000.000', '1000000.00'],
    ['999999999999,99', '999999999999.99'],
    ['R$\u00a01.234,56', '1234.56'],
  ])('le %s como %s', (input, expected) => {
    expect(parseMoney(input)).toEqual({ value: expected });
  });

  it.each([
    ['10.50', 'formato'],
    ['1.5', 'formato'],
    ['.5', 'formato'],
    ['1,5.0', 'formato'],
    ['1.23,4', 'formato'],
    ['abc', 'formato'],
    ['', 'formato'],
    ['-5', 'formato'],
    ['0,001', 'centavos'],
    ['9999999999999', 'dígitos'],
    ['0', 'maior que zero'],
    ['0,00', 'maior que zero'],
  ])('recusa %s pelo motivo %s', (input, motivo) => {
    const parsed = parseMoney(input);
    expect('error' in parsed && parsed.error).toMatch(
      motivo === 'formato' ? /formato/ : motivo === 'centavos' ? /centavos/ : new RegExp(motivo),
    );
  });

  it('o valor da API volta ao campo com virgula', () => {
    expect(moneyInput('150000.50')).toBe('150000,50');
  });

  it('data sem fuso, como veio da API', () => {
    expect(formatDate('2027-03-31')).toBe('31/03/2027');
  });
});
