import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Sector } from '@/types/setores';
import { SectorsView } from './sectors-view';

const NAMES = [
  'Comunicação',
  'Coordenação Administrativo-Financeira',
  'Coordenação Cultural',
  'Coordenação de Execução',
  'Coordenação Pedagógica',
  'Diretoria de Projetos',
];

const SECTORS: Sector[] = NAMES.map((nome, index) => ({
  id: `00000000-0000-4000-8000-0000000004${String(index).padStart(2, '0')}`,
  versao: 1,
  nome,
  ativo: index !== 2,
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 1200],
  ['desktop', 1280, 700],
])('tela de setores no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false })
          : json(SECTORS),
      ),
    );
    await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista com situacao e acoes', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <SectorsView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Diretoria de Projetos')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`setores-${device}`);
  });
});
