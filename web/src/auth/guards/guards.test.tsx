import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { clearLocalSession, signIn } from '../session';
import { AuthGuard } from './auth-guard';
import { GuestGuard } from './guest-guard';

const replace = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

function response(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

const PENDING = { accessToken: 't', perfil: 'ADMINISTRACAO_SISTEMA', deveTrocarSenha: true };
const READY = { ...PENDING, deveTrocarSenha: false };
const EXPIRED = response(401, { code: 'UNAUTHENTICATED', message: 'x' });

function refreshAnswers(answer: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(answer);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('guardas de rota', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
    replace.mockReset();
  });

  it('mostra carregamento enquanto confere a sessao pelo cookie', async () => {
    let answer!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>((r) => (answer = r))));
    render(<AuthGuard>painel</AuthGuard>);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
    expect(screen.queryByText('painel')).not.toBeInTheDocument();

    answer(response(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/entrar'));
  });

  it('sem sessao leva a tela de entrada e nao mostra o conteudo', async () => {
    refreshAnswers(EXPIRED);
    render(<AuthGuard>painel</AuthGuard>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/entrar'));
    expect(screen.queryByText('painel')).not.toBeInTheDocument();
  });

  it('recarregar a pagina recupera a sessao pelo cookie e mostra o conteudo', async () => {
    refreshAnswers(response(200, READY));
    render(<AuthGuard>painel</AuthGuard>);

    expect(await screen.findByText('painel')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('troca de senha pendente leva a troca de senha', async () => {
    refreshAnswers(response(200, PENDING));
    render(<AuthGuard>painel</AuthGuard>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/trocar-senha'));
    expect(screen.queryByText('painel')).not.toBeInTheDocument();
  });

  it('a propria tela de troca aceita a sessao com troca pendente', async () => {
    refreshAnswers(response(200, PENDING));
    render(<AuthGuard allowPendingPasswordChange>troca</AuthGuard>);

    expect(await screen.findByText('troca')).toBeInTheDocument();
  });

  it('sessao em memoria nao pede renovacao', async () => {
    const fetchMock = refreshAnswers(response(200, READY));
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
    render(<AuthGuard>painel</AuthGuard>);

    expect(await screen.findByText('painel')).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).includes('/auth/refresh')),
    ).toHaveLength(0);
  });

  it('duas guardas em modo estrito fazem uma unica renovacao', async () => {
    const fetchMock = refreshAnswers(response(200, READY));
    render(
      <StrictMode>
        <AuthGuard>painel</AuthGuard>
        <GuestGuard>entrada</GuestGuard>
      </StrictMode>,
    );

    expect(await screen.findByText('painel')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('a tela de entrada fica visivel para quem nao tem sessao', async () => {
    refreshAnswers(EXPIRED);
    render(<GuestGuard>entrada</GuestGuard>);

    expect(await screen.findByText('entrada')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it.each([
    [READY, '/'],
    [PENDING, '/trocar-senha'],
  ])('quem ja tem sessao sai da tela de entrada', async (session, destination) => {
    refreshAnswers(response(200, session));
    render(<GuestGuard>entrada</GuestGuard>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith(destination));
    expect(screen.queryByText('entrada')).not.toBeInTheDocument();
  });
});
