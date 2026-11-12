import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { clearLocalSession, getSession, signIn } from '@/auth/session';
import { DashboardLayout } from './dashboard-layout';
import { useBreadcrumbs } from './breadcrumbs';

const nav = vi.hoisted(() => ({ pathname: '/', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: nav.push }),
  usePathname: () => nav.pathname,
}));

function render(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return baseRender(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

async function openAccountMenu(): Promise<HTMLElement> {
  fireEvent.click(await screen.findByRole('button', { name: /^Conta/ }));
  return screen.findByRole('menu');
}

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

/** A sessão da barra superior responde sempre; as demais chamadas seguem a fila, na ordem. */
async function signedInAs(perfil: string, ...after: Response[]): Promise<ReturnType<typeof vi.fn>> {
  const queue = [response(200, { accessToken: 't', perfil, deveTrocarSenha: false }), ...after];
  const fetchMock = vi.fn((input: RequestInfo | URL) =>
    Promise.resolve(
      String(input).endsWith('/auth/session')
        ? response(200, {
            usuarioId: 'u-1',
            nome: 'Ana Maria Souza',
            perfil,
            setor: { id: 's-1', nome: 'Pedagógico' },
            deveTrocarSenha: false,
          })
        : (queue.shift() ?? response(204)),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
  return fetchMock;
}

describe('leiaute do painel', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
    nav.pathname = '/';
    nav.push.mockClear();
  });

  it('mostra navegacao, a conta na barra superior e o conteudo', async () => {
    viewport(1280);
    await signedInAs('ADMINISTRACAO_SISTEMA');
    render(
      <DashboardLayout>
        <p>conteudo da pagina</p>
      </DashboardLayout>,
    );

    const menu = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(menu).getByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'Conta de Ana Maria Souza: Administração do sistema',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('conteudo da pagina');
  });

  it('o menu da conta mostra nome, perfil e setor e leva a troca de senha', async () => {
    viewport(1280);
    await signedInAs('NUCLEO_PEDAGOGICO');
    render(<DashboardLayout>x</DashboardLayout>);

    const menu = await openAccountMenu();
    expect(menu).toHaveTextContent('Ana Maria Souza');
    expect(menu).toHaveTextContent('Núcleo Pedagógico');
    expect(menu).toHaveTextContent('Setor: Pedagógico');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Trocar senha' }));
    expect(nav.push).toHaveBeenCalledWith('/trocar-senha');
  });

  it('os itens do menu, a conta e a trilha tem 48 px de altura', async () => {
    viewport(1280);
    nav.pathname = '/setores';
    await signedInAs('PRESIDENCIA_GESTAO');
    render(<DashboardLayout>x</DashboardLayout>);

    const menu = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveClass('h-12');
    expect(await screen.findByRole('button', { name: /^Conta/ })).toHaveClass('h-12');
    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' });
    expect(within(trail).getByRole('link', { name: 'Início' })).toHaveClass('min-h-12');
    expect(screen.getByRole('button', { name: 'Abrir ou fechar o menu' })).toHaveClass('size-12');
  });

  it('a trilha das paginas do menu sai do proprio menu', async () => {
    viewport(1280);
    nav.pathname = '/setores';
    await signedInAs('PRESIDENCIA_GESTAO');
    render(<DashboardLayout>x</DashboardLayout>);

    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' });
    expect(within(trail).getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
    expect(within(trail).getByText('Setores')).toHaveAttribute('aria-current', 'page');
  });

  it('a pagina de detalhe define a propria trilha e a desfaz ao sair', async () => {
    viewport(1280);
    nav.pathname = '/instrumentos/i-1/projetos/p-1';
    await signedInAs('PRESIDENCIA_GESTAO');
    function Detail() {
      useBreadcrumbs([
        { label: 'Início', href: '/' },
        { label: 'Instrumentos', href: '/instrumentos' },
        { label: 'DEMO-0001/2026', href: '/instrumentos/i-1' },
        { label: 'P01' },
      ]);
      return null;
    }
    const view = render(
      <DashboardLayout>
        <Detail />
      </DashboardLayout>,
    );

    const trail = screen.getByRole('navigation', { name: 'Trilha de navegação' });
    expect(within(trail).getByRole('link', { name: 'DEMO-0001/2026' })).toHaveAttribute(
      'href',
      '/instrumentos/i-1',
    );
    expect(within(trail).getByText('P01')).toHaveAttribute('aria-current', 'page');
    // No celular só o nível anterior e o atual aparecem.
    expect(within(trail).getByRole('link', { name: 'Início' }).closest('li')).toHaveClass('hidden');
    expect(within(trail).getByRole('link', { name: 'DEMO-0001/2026' }).closest('li')).toHaveClass(
      'flex',
    );

    view.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardLayout>x</DashboardLayout>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.queryByText('P01')).not.toBeInTheDocument());
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

    fireEvent.click(within(await openAccountMenu()).getByRole('menuitem', { name: 'Sair' }));

    await waitFor(() => expect(getSession()).toBeNull());
    await new Promise((r) => setTimeout(r, 0));
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('sair encerra a sessao no servidor e na memoria', async () => {
    viewport(1280);
    const fetchMock = await signedInAs('PRESIDENCIA_GESTAO', response(204));
    render(<DashboardLayout>x</DashboardLayout>);

    fireEvent.click(within(await openAccountMenu()).getByRole('menuitem', { name: 'Sair' }));

    await waitFor(() => expect(getSession()).toBeNull());
    expect(
      fetchMock.mock.calls.map(([url]) => String(url)).some((url) => url.endsWith('/auth/logout')),
    ).toBe(true);
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
