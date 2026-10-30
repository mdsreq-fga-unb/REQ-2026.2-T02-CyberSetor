import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { PublicForm } from '@/types/inscricao-publica';
import { PublicRegistrationView } from './public-registration-view';

const FORM: PublicForm = {
  atividade: { titulo: 'Oficina de serigrafia', data: '2026-11-10', local: 'Setor Comercial Sul' },
  aberta: true,
  camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  camposAdicionais: ['CPF', 'EMAIL'],
  aviso: {
    versao: '2026-10-28-provisoria',
    texto:
      'O Instituto usa os dados deste formulário para a sua inscrição na atividade e para a prestação de contas da parceria que a financia.',
  },
  termo: {
    versao: 'a1b2c3d4e5f60718',
    texto:
      '1. Chegar no horário combinado.\n2. Avisar a equipe quando não puder vir.\n3. Cuidar do material e do espaço.',
  },
};

describe.each([
  ['celular', 360, 1600],
  ['desktop', 1280, 1400],
])('formulario publico no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(FORM), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formulario com campos, aviso e autorizacoes', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col bg-muted p-4 text-foreground">
          <PublicRegistrationView codigo="codigoPublicoA01" />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Confirmar inscrição')).toBeVisible();
    await expect
      .element(screen.getByTestId('frame'))
      .toMatchScreenshot(`inscricao-publica-${device}`);
  });
});
