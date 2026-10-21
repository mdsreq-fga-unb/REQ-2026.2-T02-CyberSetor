import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Instrument, InstrumentType } from '@/types/instrumentos';
import { InstrumentsView } from './instruments-view';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const TYPES: InstrumentType[] = ['EDITAL', 'EMENDA', 'PARCERIA'];

const INSTRUMENTS: Instrument[] = Array.from({ length: 12 }, (_, index) => ({
  id: `00000000-0000-4000-8000-0000000004${String(index).padStart(2, '0')}`,
  versao: 1,
  tipo: TYPES[index % TYPES.length],
  orgaoConcedente: `Secretaria de Cultura e Economia Criativa ${index + 1}`,
  numeroProcesso: `00150-000${String(index + 1).padStart(2, '0')}/2026-11`,
  valorGlobal: `${(index + 1) * 25000}.50`,
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
  ativo: index !== 2,
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 2400],
  ['desktop', 1280, 900],
])('tela de instrumentos no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/login')
          ? json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false })
          : json(INSTRUMENTS),
      ),
    );
    await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('primeira pagina com valor, vigencia, situacao e paginacao', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <InstrumentsView />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('1–10 de 12')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`instrumentos-${device}`);
  });
});
