import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Account } from '@/types/contas';
import { AccountsView } from './accounts-view';

const PERFIS = ['ADMINISTRACAO_SISTEMA', 'NUCLEO_PEDAGOGICO', 'PRESIDENCIA_GESTAO'] as const;

const ACCOUNTS: Account[] = Array.from({ length: 12 }, (_, index) => ({
  id: `00000000-0000-4000-8000-0000000002${String(index).padStart(2, '0')}`,
  pessoaId: `00000000-0000-4000-8000-0000000003${String(index).padStart(2, '0')}`,
  nome: `Pessoa ${String(index + 1).padStart(2, '0')} da Equipe`,
  emailLogin: `pessoa${index + 1}@instituto.org.br`,
  perfil: PERFIS[index % PERFIS.length],
  ativo: index !== 3,
  deveTrocarSenha: index % 4 === 1,
  bloqueadoAte: null,
  ultimoAcessoEm: null,
  setor:
    index % 3 === 1
      ? { id: '00000000-0000-4000-8000-000000000401', nome: 'Coordenação Pedagógica' }
      : null,
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 1600],
  ['desktop', 1280, 900],
])('tela de contas no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'ADMINISTRACAO_SISTEMA', deveTrocarSenha: false })
          : json(ACCOUNTS),
      ),
    );
    await signIn('admin@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('primeira pagina com perfil, situacao e paginacao', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <AccountsView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('1–10 de 12')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`contas-${device}`);
  });
});
