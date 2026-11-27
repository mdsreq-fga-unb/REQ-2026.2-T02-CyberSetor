import { act, cleanup, render, screen } from '@testing-library/react';
import { SLOW_LOADING_MS, SessionLoading } from './session-loading';

describe('carregamento da sessão (#329, RNF15)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('mostra "Carregando…" e, se demorar, diz o que fazer com um botão para tentar de novo', () => {
    render(<SessionLoading />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    act(() => vi.advanceTimersByTime(SLOW_LOADING_MS - 1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('alert')).toHaveTextContent('Confira a conexão com a internet');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
