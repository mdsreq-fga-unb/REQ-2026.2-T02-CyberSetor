import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Button } from '@/components/ui/button';
import type { ProjectTimeline } from '@/types/prazos';
import { ProjectDeadlinesSection } from './project-deadlines-section';
import { NO_GOALS, PROJECT_ID, TIMELINE } from './project-deadlines-fixtures';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

async function show(timeline: ProjectTimeline, waitFor: string, name: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.endsWith('/auth/login')
        ? json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false })
        : json(timeline),
    ),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const screen = await render(
    <QueryClientProvider client={client}>
      <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
        <ProjectDeadlinesSection projectId={PROJECT_ID} createGoal={<Button>Nova meta</Button>} />
      </div>
    </QueryClientProvider>,
  );
  await expect.element(screen.getByText(waitFor).first()).toBeVisible();
  await expect.element(screen.getByTestId('frame')).toMatchScreenshot(name);
}

describe.each([
  ['celular', 360, 2600],
  ['desktop', 1280, 1500],
])('prazos do projeto no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('painel, linha do tempo e requisitos', async () => {
    await show(TIMELINE, 'Prazos das metas', `prazos-${device}`);
  });

  it('projeto sem meta', async () => {
    await show(NO_GOALS, 'Nenhuma meta cadastrada', `prazos-sem-meta-${device}`);
  });
});
