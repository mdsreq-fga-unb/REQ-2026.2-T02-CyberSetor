import { formatDate, moneyInput, parseMoney } from './format';

describe('valor e data do instrumento', () => {
  it.each([
    ['150.000,50', '150000.50'],
    ['150000', '150000.00'],
    ['R$ 1.234,5', '1234.50'],
    ['150.000', '150000.00'],
  ])('le %s como %s', (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it.each(['', 'abc', '10,123', '1,2,3', '-5'])('recusa %s', (input) => {
    expect(parseMoney(input)).toBeNull();
  });

  it('o valor da API volta ao campo com virgula', () => {
    expect(moneyInput('150000.50')).toBe('150000,50');
  });

  it('data sem fuso, como veio da API', () => {
    expect(formatDate('2027-03-31')).toBe('31/03/2027');
  });
});
