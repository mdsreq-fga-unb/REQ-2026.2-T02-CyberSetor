import { act, renderHook } from '@testing-library/react';
import { useStoredChoice } from './use-stored-choice';

const OPTIONS = ['lista', 'quadro'] as const;

describe('escolha lembrada no navegador', () => {
  afterEach(() => window.localStorage.clear());

  it('comeca sem escolha, guarda a escolhida e volta ao padrao', () => {
    const { result } = renderHook(() => useStoredChoice('teste-visao', OPTIONS));
    expect(result.current[0]).toBeNull();

    act(() => result.current[1]('quadro'));
    expect(result.current[0]).toBe('quadro');
    expect(window.localStorage.getItem('teste-visao')).toBe('quadro');

    act(() => result.current[1](null));
    expect(result.current[0]).toBeNull();
  });

  it('ignora valor guardado que nao e uma das opcoes', () => {
    window.localStorage.setItem('teste-visao', 'tabela');
    const { result } = renderHook(() => useStoredChoice('teste-visao', OPTIONS));

    expect(result.current[0]).toBeNull();
  });
});
