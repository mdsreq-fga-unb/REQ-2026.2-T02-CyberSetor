import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Report, ReportPdfLink, ReportPreview } from '@/types/relatorios';
import { ProjectReportsSection } from './project-reports-section';

const PROJECT_ID = '00000000-0000-4000-8000-000000000301';
const SHA = 'a3f1c9e07b5d4e2f8a6b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f';

const V1: Report = {
  id: '00000000-0000-4000-8000-000000000401',
  projetoId: PROJECT_ID,
  versao: 1,
  periodoInicio: '2025-01-01',
  periodoFim: '2025-06-30',
  relatorioAnteriorId: null,
  motivoRetificacao: null,
  emitidoPor: { id: 'u1', nome: 'Beatriz Gestão' },
  criadoEm: '2025-07-02T17:30:00.000Z',
  metas: [],
  pdf: { sha256: SHA, geradoEm: '2025-07-03T12:00:00.000Z' },
};

const REPORTS: Report[] = [
  {
    ...V1,
    id: '00000000-0000-4000-8000-000000000402',
    versao: 2,
    relatorioAnteriorId: V1.id,
    motivoRetificacao: 'Inclusão de comprovação.',
    criadoEm: '2025-08-10T13:00:00.000Z',
    pdf: null,
  },
  V1,
];

const LINK: ReportPdfLink = {
  url: 'https://api.test/v1/files/token-assinado',
  expiraEm: '2025-07-03T12:05:00.000Z',
  nomeArquivo: 'relatorio-P01-2025-01-01-a-2025-06-30-v1.pdf',
  sha256: SHA,
  geradoEm: '2025-07-03T12:00:00.000Z',
};

const PREVIEW: ReportPreview = {
  projeto: {
    id: PROJECT_ID,
    codigo: 'P01',
    titulo: 'Oficinas Culturais',
    instrumentoId: 'inst-1',
    inicio: '2025-01-01',
    fim: '2026-12-31',
  },
  periodo: { from: '2025-01-01', to: '2025-06-30' },
  metas: [],
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 800],
  ['desktop', 1280, 700],
])('relatorios emitidos no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          return json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false });
        }
        if (url.includes('/report-preview')) return json(PREVIEW);
        return json(url.endsWith('/pdf') ? LINK : REPORTS);
      }),
    );
    await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  function renderSection() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <ProjectReportsSection projectId={PROJECT_ID} />
        </div>
      </QueryClientProvider>,
    );
  }

  it('lista as versoes com a retificacao e o hash do PDF', async () => {
    const screen = await renderSection();

    await expect.element(screen.getByText('Ainda não gerado').first()).toBeInTheDocument();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`relatorios-${device}`);
  });

  it('dialogo com o SHA-256 e o link do PDF', async () => {
    await renderSection();

    await page
      .getByRole('button', { name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1' })
      .click();
    await page.getByRole('menuitem', { name: 'Baixar PDF' }).click();
    await expect.element(page.getByLabelText('SHA-256 do arquivo')).toBeVisible();
    await expect.element(page.getByRole('dialog')).toMatchScreenshot(`relatorio-pdf-${device}`);
  });

  it('dialogo de retificacao com o motivo', async () => {
    await renderSection();

    await page
      .getByRole('button', { name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 2' })
      .click();
    await page.getByRole('menuitem', { name: 'Retificar relatório' }).click();
    await expect.element(page.getByRole('button', { name: 'Emitir retificação' })).toBeEnabled();
    await expect
      .element(page.getByRole('dialog'))
      .toMatchScreenshot(`relatorio-retificar-${device}`);
  });
});
