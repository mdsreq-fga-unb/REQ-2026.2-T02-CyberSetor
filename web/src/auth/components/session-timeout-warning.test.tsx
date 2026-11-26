import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  SESSION_IDLE_TIMEOUT_MS,
  authorizedRequest,
  SESSION_WARNING_LEAD_MS,
  clearLocalSession,
  getSession,
  signIn,
} from '../session';
import { SessionTimeoutWarning, formatRemainingTime } from './session-timeout-warning';

const ACCESS = { accessToken: 'token-1', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false };

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('aviso de expiracao da sessao (WCAG 2.2.1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'));
  });

  afterEach(() => {
    cleanup();
    clearLocalSession();
    window.localStorage.clear();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('formata minutos e segundos restantes', () => {
    expect(formatRemainingTime(180_000)).toBe('3 min');
    expect(formatRemainingTime(125_000)).toBe('2 min 5 s');
    expect(formatRemainingTime(45_000)).toBe('45 s');
    expect(formatRemainingTime(0)).toBe('0 s');
  });

  it('avisa pelo menos 2 minutos antes de expirar e renova sem perder o que estava na tela', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/login')) return Promise.resolve(jsonResponse(200, ACCESS));
      if (url.includes('/auth/session')) {
        return Promise.resolve(
          jsonResponse(200, {
            usuarioId: 'u1',
            nome: 'Gestão',
            setor: null,
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          }),
        );
      }
      return Promise.resolve(jsonResponse(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    render(
      <div>
        <label htmlFor="justificativa">Justificativa</label>
        <input id="justificativa" defaultValue="" />
        <SessionTimeoutWarning />
      </div>,
    );

    const input = screen.getByLabelText('Justificativa') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Texto em preenchimento' } });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Avança até o início do aviso (27 min, restando 3 min >= 2 min exigidos).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_LEAD_MS);
    });

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Sua sessão vai expirar em breve');
    expect(dialog).toHaveTextContent('Restam 3 min');

    const continueButton = screen.getByRole('button', { name: 'Continuar conectado' });
    expect(continueButton).toHaveClass('h-12');

    await act(async () => {
      fireEvent.click(continueButton);
      await Promise.resolve();
    });

    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/auth/session'))).toBe(true);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(input.value).toBe('Texto em preenchimento');
    expect(getSession()).toEqual(ACCESS);

    // Após renovar, só volta a avisar depois de nova janela de inatividade.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_WARNING_LEAD_MS + 60_000);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('encerra a sessao quando o tempo acaba sem resposta (RNF03)', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/login')) return Promise.resolve(jsonResponse(200, ACCESS));
      if (url.includes('/auth/logout')) return Promise.resolve(jsonResponse(204));
      return Promise.resolve(jsonResponse(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    render(<SessionTimeoutWarning />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_LEAD_MS);
    });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_WARNING_LEAD_MS);
    });

    expect(getSession()).toBeNull();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/auth/logout'))).toBe(true);
  });

  it('mostra erro amigavel se a renovacao falhar sem expor detalhe interno', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/login')) return Promise.resolve(jsonResponse(200, ACCESS));
      if (url.includes('/auth/session')) {
        return Promise.resolve(
          jsonResponse(500, { code: 'INTERNAL_ERROR', message: 'SQL connection dropped' }),
        );
      }
      return Promise.resolve(jsonResponse(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    render(<SessionTimeoutWarning />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_LEAD_MS);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Continuar conectado' }));
      await Promise.resolve();
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível renovar a sessão. Tente novamente.');
    expect(alert).not.toHaveTextContent('SQL connection dropped');
  });

  it('uso em outra aba adia o aviso e nao encerra a sessao da aba em uso', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/login')) return Promise.resolve(jsonResponse(200, ACCESS));
      if (url.includes('/auth/logout')) return Promise.resolve(jsonResponse(204));
      return Promise.resolve(jsonResponse(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
    render(<SessionTimeoutWarning />);

    // Aos 20 min, a outra aba usa o sistema e avisa esta pelo evento de armazenamento.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20 * 60_000);
    });
    const otherTab = String(Date.now());
    window.localStorage.setItem('cybersetor-ultima-atividade', otherTab);
    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'cybersetor-ultima-atividade', newValue: otherTab }),
      );
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - 20 * 60_000);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(getSession()).toEqual(ACCESS);

    // Mesmo sem o evento, a aba confere o registro compartilhado antes de sair.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });
    // Aos 35 min: o prazo antigo (50 min) passa, mas o registrado agora vai a 65 min.
    window.localStorage.setItem('cybersetor-ultima-atividade', String(Date.now()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16 * 60_000);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(getSession()).toEqual(ACCESS);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/auth/logout'))).toBe(false);
  });

  it('o erro da renovacao nao volta no aviso seguinte', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/login')) return Promise.resolve(jsonResponse(200, ACCESS));
      if (url.includes('/auth/session')) {
        return Promise.resolve(jsonResponse(500, { code: 'INTERNAL_ERROR', message: 'x' }));
      }
      return Promise.resolve(jsonResponse(200, []));
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
    render(<SessionTimeoutWarning />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_LEAD_MS);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Continuar conectado' }));
      await Promise.resolve();
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Uma requisição em segundo plano renova a atividade e fecha o aviso.
    await act(async () => {
      await authorizedRequest('/projects');
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_LEAD_MS);
    });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
