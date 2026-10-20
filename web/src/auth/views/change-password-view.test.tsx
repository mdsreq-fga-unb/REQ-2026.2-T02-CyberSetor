import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clearLocalSession, getSession, signIn } from '../session';
import { ChangePasswordView } from './change-password-view';

const replace = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const ACCESS = { accessToken: 't', perfil: 'ADMINISTRACAO_SISTEMA', deveTrocarSenha: true };
const NEW_PASSWORD = 'nova-senha-com-mais-de-quinze';

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function fill(current: string, next: string, confirmation: string): void {
  fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: current } });
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: next } });
  fireEvent.change(screen.getByLabelText('Repita a nova senha'), {
    target: { value: confirmation },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
}

async function signedIn(...after: Response[]): Promise<ReturnType<typeof vi.fn>> {
  const fetchMock = vi.fn().mockResolvedValueOnce(response(200, ACCESS));
  after.forEach((r) => fetchMock.mockResolvedValueOnce(r));
  vi.stubGlobal('fetch', fetchMock);
  await signIn('pessoa@instituto.org.br', 'senha-temporaria-longa');
  return fetchMock;
}

describe('troca de senha obrigatoria', () => {
  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
    replace.mockReset();
  });

  it('tem um titulo de nivel 1 para a pagina', () => {
    render(<ChangePasswordView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Trocar senha' })).toBeInTheDocument();
  });

  it('pede os tres campos antes de enviar', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ChangePasswordView />);

    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    expect(await screen.findByText('Informe a senha atual.')).toBeInTheDocument();
    expect(
      screen.getByText('A nova senha precisa ter pelo menos 15 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Repita a nova senha.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recusa nova senha acima de 64 caracteres', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', 'x'.repeat(65), 'x'.repeat(65));

    expect(
      await screen.findByText('A nova senha tem no máximo 64 caracteres.'),
    ).toBeInTheDocument();
  });

  it('recusa confirmacao diferente da nova senha', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', NEW_PASSWORD, `${NEW_PASSWORD}-x`);

    expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument();
  });

  it('recusa nova senha com 14 caracteres e aceita os limites de 15 e 64', async () => {
    const fetchMock = await signedIn(response(400, { code: 'X', message: 'a' }));
    fetchMock.mockResolvedValue(response(400, { code: 'X', message: 'b' }));
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', 'x'.repeat(14), 'x'.repeat(14));
    expect(
      await screen.findByText('A nova senha precisa ter pelo menos 15 caracteres.'),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fill('senha-temporaria-longa', 'x'.repeat(15), 'x'.repeat(15));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fill('senha-temporaria-longa', 'y'.repeat(64), 'y'.repeat(64));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it('recusa senha atual acima do limite da API', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<ChangePasswordView />);

    fill('x'.repeat(65), NEW_PASSWORD, NEW_PASSWORD);

    expect(
      await screen.findByText('A senha atual tem no máximo 64 caracteres.'),
    ).toBeInTheDocument();
  });

  it('mostra a mensagem da API quando a senha atual esta errada e devolve o foco a ela', async () => {
    await signedIn(response(400, { code: 'VALIDATION_ERROR', message: 'Senha atual incorreta.' }));
    render(<ChangePasswordView />);

    fill('senha-errada', NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText('Senha atual incorreta.')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveFocus();
    expect(replace).not.toHaveBeenCalled();
  });

  it.each([
    [
      response(429, { code: 'RATE_LIMITED', message: 'x' }),
      'Muitas tentativas. Aguarde um minuto e tente de novo.',
    ],
    [
      response(500, { code: 'INTERNAL_ERROR', message: 'x' }),
      'Não foi possível trocar a senha. Tente de novo.',
    ],
  ])('mostra aviso proprio para outros erros sem mover o foco', async (failure, notice) => {
    await signedIn(failure);
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText(notice)).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).not.toHaveFocus();
  });

  it('avisa quando o servidor nao responde', async () => {
    const fetchMock = await signedIn();
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', NEW_PASSWORD, NEW_PASSWORD);

    expect(
      await screen.findByText('Não foi possível falar com o servidor. Tente de novo.'),
    ).toBeInTheDocument();
  });

  it('troca a senha com a requisicao do contrato e segue ao painel', async () => {
    const fetchMock = await signedIn(response(204));
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', NEW_PASSWORD, NEW_PASSWORD);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toContain('/auth/password');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer t');
    expect(JSON.parse(String(init.body))).toEqual({
      senhaAtual: 'senha-temporaria-longa',
      novaSenha: NEW_PASSWORD,
    });
    expect(getSession()?.deveTrocarSenha).toBe(false);
  });

  it('volta a tela de entrada e limpa a sessao quando ela acabou', async () => {
    await signedIn(
      response(401, { code: 'UNAUTHENTICATED', message: 'x' }),
      response(401, { code: 'UNAUTHENTICATED', message: 'x' }),
    );
    render(<ChangePasswordView />);

    fill('senha-temporaria-longa', NEW_PASSWORD, NEW_PASSWORD);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/entrar'));
    expect(getSession()).toBeNull();
  });
});
