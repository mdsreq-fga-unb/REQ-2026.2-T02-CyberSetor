import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clearLocalSession } from '../session';
import { SignInView } from './sign-in-view';

const replace = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

function response(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

function fill(email: string, senha: string): void {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: senha } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('tela de entrada', () => {
  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
    replace.mockReset();
  });

  it('tem um titulo de nivel 1 para a pagina', () => {
    render(<SignInView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Entrar' })).toBeInTheDocument();
  });

  it('pede e-mail e senha antes de enviar e liga cada erro ao seu campo', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<SignInView />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Informe o e-mail.');
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('Informe a senha.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recusa senha acima do limite da API', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'x'.repeat(65));

    expect(await screen.findByText('A senha tem no máximo 64 caracteres.')).toBeInTheDocument();
  });

  it('erro inesperado do servidor mostra aviso neutro e devolve o foco a senha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response(500, { code: 'INTERNAL_ERROR', message: 'x' })),
    );
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-de-teste-longa');

    expect(await screen.findByText('Não foi possível entrar. Tente de novo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toHaveFocus();
  });

  it('um novo envio apaga o erro do servidor anterior', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(401, { code: 'UNAUTHENTICATED', message: 'E-mail ou senha incorretos.' }),
        ),
    );
    render(<SignInView />);
    fill('pessoa@instituto.org.br', 'senha-errada');
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument();

    fill('', 'senha-errada');

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.queryByText('E-mail ou senha incorretos.')).not.toBeInTheDocument();
  });

  it('recusa e-mail fora do formato', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<SignInView />);

    fill('pessoa', 'senha-de-teste-longa');

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
  });

  it('mostra a mensagem da API quando e-mail ou senha nao conferem', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(401, { code: 'UNAUTHENTICATED', message: 'E-mail ou senha incorretos.' }),
        ),
    );
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-errada');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('avisa quando o limite de tentativas foi atingido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response(429, { code: 'RATE_LIMITED', message: 'x' })),
    );
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-de-teste-longa');

    expect(
      await screen.findByText('Muitas tentativas. Aguarde um minuto e tente de novo.'),
    ).toBeInTheDocument();
  });

  it('avisa quando o servidor nao responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-de-teste-longa');

    expect(
      await screen.findByText('Não foi possível falar com o servidor. Tente de novo.'),
    ).toBeInTheDocument();
  });

  it('leva a troca de senha quando ela e obrigatoria', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response(200, {
          accessToken: 't',
          perfil: 'ADMINISTRACAO_SISTEMA',
          deveTrocarSenha: true,
        }),
      ),
    );
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/trocar-senha'));
  });

  it('leva ao painel quando a senha ja foi trocada', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(200, { accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false }),
        ),
    );
    render(<SignInView />);

    fill('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });
});
