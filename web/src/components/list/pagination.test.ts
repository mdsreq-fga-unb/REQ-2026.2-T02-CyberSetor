import { pageWindow, rangeLabel } from './pagination';

describe('janela da pagina', () => {
  it.each([
    [42, 1, 10, { page: 1, pageCount: 5, start: 1, end: 10 }],
    [42, 5, 10, { page: 5, pageCount: 5, start: 41, end: 42 }],
    [10, 1, 10, { page: 1, pageCount: 1, start: 1, end: 10 }],
    [0, 1, 10, { page: 1, pageCount: 1, start: 0, end: 0 }],
  ])('%i registros, pagina %i de %i itens', (total, page, size, expected) => {
    expect(pageWindow(total, page, size)).toEqual(expected);
  });

  it('pagina alem da ultima volta para a ultima, como depois de desativar o ultimo da pagina', () => {
    expect(pageWindow(20, 3, 10)).toEqual({ page: 2, pageCount: 2, start: 11, end: 20 });
  });

  it('pagina menor que 1 e tamanho invalido nao quebram a conta', () => {
    expect(pageWindow(5, 0, 0)).toEqual({ page: 1, pageCount: 5, start: 1, end: 1 });
    expect(pageWindow(5, -3, 10).page).toBe(1);
  });

  it('rotulo do intervalo em portugues', () => {
    expect(rangeLabel(pageWindow(42, 2, 10), 42)).toBe('11–20 de 42');
    expect(rangeLabel(pageWindow(0, 1, 10), 0)).toBe('Nenhum registro');
  });
});
