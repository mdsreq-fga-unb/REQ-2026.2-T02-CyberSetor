import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { ParticipantSummary } from '@/types/participantes';
import { ParticipantsView } from './participants-view';

const NOMES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Davi Rocha'];

const PARTICIPANTES: ParticipantSummary[] = NOMES.map((nome, index) => ({
  id: `00000000-0000-4000-8000-00000000070${index}`,
  versao: 1,
  nome,
  nomePreferencia: null,
  idade: 15 + index * 7,
  telefone: `6199999${String(index).padStart(4, '0')}`,
  email: null,
  inscricoes: index + 1,
  ultimaAtividade:
    index === 3 ? null : { id: `a${index}`, titulo: 'Oficina de serigrafia', data: '2026-11-10' },
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 1200],
  ['desktop', 1280, 700],
])('tela de participantes no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false })
          : json(PARTICIPANTES),
      ),
    );
    await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista com busca, idade, inscricoes e ultima atividade', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <ParticipantsView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Davi Rocha')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`participantes-${device}`);
  });
});
