import { act, renderHook } from '@testing-library/react';
import { useDialogState } from './use-dialog-state';

describe('estado de dialogo', () => {
  it('abre com o registro e o mantem depois de fechar, para a animacao de saida', () => {
    const { result } = renderHook(() => useDialogState<string>());
    expect(result.current).toMatchObject({ open: false, value: null });

    act(() => result.current.show('Ana'));
    expect(result.current).toMatchObject({ open: true, value: 'Ana' });

    act(() => result.current.close());
    expect(result.current).toMatchObject({ open: false, value: 'Ana' });

    act(() => result.current.show('Bia'));
    expect(result.current).toMatchObject({ open: true, value: 'Bia' });
  });
});
