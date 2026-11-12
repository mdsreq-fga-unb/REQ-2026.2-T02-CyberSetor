import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import { NUCLEO } from './home-fixtures';
import { HomeView } from './home-view';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 2300],
  ['desktop', 1280, 1100],
])('tela inicial no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false })
          : json(NUCLEO),
      ),
    );
    await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('painel com prazos, inscricoes, atividades e vigencias', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <HomeView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Roda de conversa com as famílias')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`inicio-${device}`);
  });
});
