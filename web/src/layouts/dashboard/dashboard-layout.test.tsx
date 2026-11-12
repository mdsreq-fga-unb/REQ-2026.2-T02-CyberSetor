import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clearLocalSession, getSession, signIn } from '@/auth/session';
import { DashboardLayout } from './dashboard-layout';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/',
}));

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function viewport(width: number): void {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: width < 768,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

async function signedInAs(perfil: string, ...after: Response[]): Promise<ReturnType<typeof vi.fn>> {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response(200, { accessToken: 't', perfil, deveTrocarSenha: false }));
  after.forEach((r) => fetchMock.mockResolvedValueOnce(r));
  vi.stubGlobal('fetch', fetchMock);
  await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
  return fetchMock;
}

describe('leiaute do painel', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('mostra navegacao, perfil da sessao, sair e o conteudo', async () => {
    viewport(1280);
    await signedInAs('ADMINISTRACAO_SISTEMA');
    render(
      <DashboardLayout>
        <p>conteudo da pagina</p>
      </DashboardLayout>,
    );

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByText('Administração do sistema')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('conteudo da pagina');
  });

  it('os itens do menu e o sair tem 48 px de altura', async () => {
    viewport(1280);
    await signedInAs('NUCLEO_PEDAGOGICO');
    render(<DashboardLayout>x</DashboardLayout>);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveClass('h-12');
    expect(screen.getByRole('button', { name: 'Sair' })).toHaveClass('h-12');
    expect(screen.getByRole('button', { name: 'Abrir ou fechar o menu' })).toHaveClass('size-12');
  });

  it('no modo recolhido os itens continuam com 48 px', async () => {
    viewport(1280);
    await signedInAs('NUCLEO_PEDAGOGICO');
    render(<DashboardLayout>x</DashboardLayout>);

    const item = screen.getByRole('link', { name: 'Início' });
    expect(item.className).toContain('group-data-[collapsible=icon]:size-12!');
    expect(item.className).not.toContain('group-data-[collapsible=icon]:size-8!');
  });

  it('marca a pagina atual para leitor de tela', async () => {
    viewport(1280);
    await signedInAs('NUCLEO_PEDAGOGICO');
    render(<DashboardLayout>x</DashboardLayout>);

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
  });

  it('falha no logout nao deixa rejeicao sem tratamento e encerra a sessao local', async () => {
    viewport(1280);
    await signedInAs('PRESIDENCIA_GESTAO', response(500, { code: 'INTERNAL_ERROR', message: 'x' }));
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    render(<DashboardLayout>x</DashboardLayout>);

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(getSession()).toBeNull());
    await new Promise((r) => setTimeout(r, 0));
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('sair encerra a sessao no servidor e na memoria', async () => {
    viewport(1280);
    const fetchMock = await signedInAs('PRESIDENCIA_GESTAO', response(204));
    render(<DashboardLayout>x</DashboardLayout>);

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(getSession()).toBeNull());
    expect(String(fetchMock.mock.calls[1][0])).toContain('/auth/logout');
  });

  it('no celular o menu abre como gaveta e fecha ao escolher um destino', async () => {
    viewport(390);
    await signedInAs('NUCLEO_PEDAGOGICO');
    render(<DashboardLayout>x</DashboardLayout>);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir ou fechar o menu' }));
    const drawer = await screen.findByRole('dialog');
    fireEvent.click(within(drawer).getByRole('link', { name: 'Início' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
