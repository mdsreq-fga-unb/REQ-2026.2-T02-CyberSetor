import { documentFileProblem, formatBytes } from './format';

describe('documento formal', () => {
  it('tamanho em KB ou MB, com virgula', () => {
    expect(formatBytes(300)).toBe('1 KB');
    expect(formatBytes(250 * 1024)).toBe('250 KB');
    expect(formatBytes(1_572_864)).toBe('1,5 MB');
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
