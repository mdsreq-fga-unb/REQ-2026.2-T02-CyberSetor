import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Modality } from '@/types/modalidades';
import { ModalitiesView } from './modalities-view';

const NAMES = ['Ação de acolhimento', 'Evento aberto', 'Oficina contínua', 'Roda de conversa'];

const MODALITIES: Modality[] = NAMES.map((nome, index) => ({
  id: `00000000-0000-4000-8000-0000000005${String(index).padStart(2, '0')}`,
  versao: 1,
  nome,
  descricao: index % 2 === 0 ? 'Registro de público por contagem agregada, sem CPF' : null,
  ativo: index !== 1,
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 1200],
  ['desktop', 1280, 700],
])('tela de modalidades no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false })
          : json(MODALITIES),
      ),
    );
    await signIn('pedagogico@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista com descricao, situacao e acoes', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <ModalitiesView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Roda de conversa')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`modalidades-${device}`);
  });
});
