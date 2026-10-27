import {
  documentFileProblem,
  formatBytes,
  formatDate,
  formatDateTime,
  moneyInput,
  parseMoney,
} from './format';

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

describe('documento formal', () => {
  it('tamanho em KB ou MB, com virgula', () => {
    expect(formatBytes(300)).toBe('1 KB');
    expect(formatBytes(250 * 1024)).toBe('250 KB');
    expect(formatBytes(1_572_864)).toBe('1,5 MB');
  });

  it('data e hora de Brasilia', () => {
    expect(formatDateTime('2026-10-27T13:05:00.000Z')).toBe('27/10/2026, 10:05');
  });

  it('confere extensao e tamanho antes do envio', () => {
    const file = (name: string, size: number) => {
      const value = new File(['x'], name);
      Object.defineProperty(value, 'size', { value: size });
      return value;
    };
    expect(documentFileProblem(file('termo.PDF', 10))).toBeNull();
    expect(documentFileProblem(file('termo.docx', 10))).toBeNull();
    expect(documentFileProblem(file('termo.doc', 10))).toMatch(/PDF ou DOCX/);
    expect(documentFileProblem(file('termo.pdf', 20 * 1024 * 1024 + 1))).toMatch(/20 MB/);
    expect(documentFileProblem(file('termo.pdf', 0))).toMatch(/vazio/);
  });
});
