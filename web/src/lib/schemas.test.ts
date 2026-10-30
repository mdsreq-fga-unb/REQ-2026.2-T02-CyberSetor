import { decimalSchema, moneySchema, timeSchema } from './schemas';

describe('regras dos campos', () => {
  it.each([
    ['150000', '150000.00'],
    ['150000.5', '150000.50'],
    ['999999999999.99', '999999999999.99'],
  ])('valor %s sai como %s', (input, expected) => {
    expect(moneySchema().parse(input)).toBe(expected);
  });

  it.each([
    ['', 'Informe o valor.'],
    ['0', 'Informe um valor maior que zero.'],
    ['0.001', 'Informe um valor maior que zero.'],
    ['1000000000000', 'O valor tem no máximo 12 dígitos antes da vírgula.'],
  ])('valor %s e recusado', (input, message) => {
    const result = moneySchema().safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(message);
  });

  it('decimal com ate duas casas; positivo recusa zero', () => {
    const schema = decimalSchema('Informe o número.', { positive: true });
    expect(schema.safeParse('12.5').success).toBe(true);
    expect(schema.safeParse('0').success).toBe(false);
    expect(schema.safeParse('12.555').success).toBe(false);
    expect(decimalSchema('Informe o número.').safeParse('0').success).toBe(true);
  });

  it('hora no formato do seletor nativo', () => {
    expect(timeSchema().safeParse('09:00').success).toBe(true);
    expect(timeSchema().safeParse('23:59').success).toBe(true);
    expect(timeSchema().safeParse('24:00').success).toBe(false);
    expect(timeSchema().safeParse('9:00').success).toBe(false);
  });
});
