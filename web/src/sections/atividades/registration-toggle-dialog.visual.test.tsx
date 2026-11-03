import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import { RegistrationToggleDialog } from './registration-toggle-dialog';

const ACTIVITY = {
  id: '00000000-0000-4000-8000-000000000061',
  titulo: 'Oficina de serigrafia',
  data: '2099-12-10',
  inscricao: { aberta: false, vagas: 30, inscritos: 12 },
} as Activity;

const REGISTRATION = {
  atividadeId: ACTIVITY.id,
  versao: 3,
  aberta: false,
  vagas: 30,
  prazoInscricao: '2026-10-01',
  prazoHora: '18:00',
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 800],
  ['desktop', 1280, 700],
])('reabrir inscricao com o prazo vencido no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'NUCLEO_PEDAGOGICO', deveTrocarSenha: false })
          : json(REGISTRATION),
      ),
    );
    await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('pede o prazo novo antes de reabrir', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await render(
      <QueryClientProvider client={client}>
        <RegistrationToggleDialog
          activity={ACTIVITY}
          onClose={() => undefined}
          onDone={() => undefined}
        />
      </QueryClientProvider>,
    );

    await page.getByRole('button', { name: 'Reabrir inscrições' }).click();
    await expect.element(page.getByLabelText('Inscrições até')).toBeVisible();
    await expect
      .element(page.getByRole('alertdialog'))
      .toMatchScreenshot(`reabrir-prazo-vencido-${device}`);
  });
});
