import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Report, ReportPdfLink } from '@/types/relatorios';
import { ProjectReportsSection } from './project-reports-section';

const PROJECT_ID = '00000000-0000-4000-8000-000000000301';
const SHA = 'a3f1c9e07b5d4e2f8a6b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f';

const REPORT: Report = {
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
  pdf: null,
};

const LINK: ReportPdfLink = {
  url: 'https://api.test/v1/files/token-assinado',
  expiraEm: '2025-07-02T17:35:00.000Z',
  nomeArquivo: 'relatorio-P01-2025-01-01-a-2025-06-30-v1.pdf',
  sha256: SHA,
  geradoEm: '2025-07-03T12:00:00.000Z',
};

type Route = () => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      calls.push(key);
      if (key === 'POST /auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route();
      return json(result.status, result.body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ProjectReportsSection projectId={PROJECT_ID} />
    </QueryClientProvider>,
  );
}

const LIST = `GET /projects/${PROJECT_ID}/reports`;
const PDF = `GET /projects/${PROJECT_ID}/reports/${REPORT.id}/pdf`;

describe('ProjectReportsSection', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista as versoes emitidas com a retificacao e o hash do PDF ja gerado', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({
        status: 200,
        body: [
          { ...REPORT, id: 'v2', versao: 2, relatorioAnteriorId: REPORT.id, pdf: null },
          { ...REPORT, pdf: { sha256: SHA, geradoEm: LINK.geradoEm } },
        ],
      }),
    });
    renderSection();

    expect((await screen.findAllByText('Versão 2')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Retificação').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ainda não gerado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SHA-256 a3f1c9e07b5d…').length).toBeGreaterThan(0);
  });

  it('sem relatorio emitido, explica onde as versoes vao aparecer', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', { [LIST]: () => ({ status: 200, body: [] }) });
    renderSection();

    expect(await screen.findByText('Nenhum relatório emitido neste projeto')).toBeInTheDocument();
  });

  it('perfil sem leitura de relatorios ve o motivo', async () => {
    await signedInAs('CONCEDENTE_AUDITORIA', {
      [LIST]: () => ({ status: 403, body: { code: 'FORBIDDEN', message: 'Sem permissão' } }),
    });
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O seu perfil não consulta relatórios emitidos.',
    );
  });

  it('prepara o PDF, mostra o SHA-256 e entrega o link para baixar', async () => {
    const calls = await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      [LIST]: () => ({ status: 200, body: [REPORT] }),
      [PDF]: () => ({ status: 200, body: LINK }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Baixar PDF' }));

    expect(await screen.findByLabelText('SHA-256 do arquivo')).toHaveValue(SHA);
    expect(screen.getByRole('link', { name: /Baixar PDF/ })).toHaveAttribute('href', LINK.url);
    expect(calls.filter((call) => call === PDF)).toHaveLength(1);
    // A linha ganha o hash com a resposta do PDF, sem ler a lista de novo.
    expect(screen.getAllByText('SHA-256 a3f1c9e07b5d…').length).toBeGreaterThan(0);
    expect(calls.filter((call) => call === LIST)).toHaveLength(1);
  });

  it('com o dialogo aberto, renova o link antes de expirar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      let renewed = 0;
      await signedInAs('PRESIDENCIA_GESTAO', {
        [LIST]: () => ({ status: 200, body: [REPORT] }),
        [PDF]: () => {
          renewed += 1;
          return { status: 200, body: { ...LINK, url: `${LINK.url}?v=${renewed}` } };
        },
      });
      renderSection();

      fireEvent.click(
        await screen.findByRole('button', {
          name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
        }),
      );
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Baixar PDF' }));
      expect(await screen.findByRole('link', { name: /Baixar PDF/ })).toHaveAttribute(
        'href',
        `${LINK.url}?v=1`,
      );

      await vi.advanceTimersByTimeAsync(4 * 60 * 1000);

      await vi.waitFor(() =>
        expect(screen.getByRole('link', { name: /Baixar PDF/ })).toHaveAttribute(
          'href',
          `${LINK.url}?v=2`,
        ),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('falha ao carregar a lista oferece tentar de novo', async () => {
    let attempts = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => {
        attempts += 1;
        return attempts === 1
          ? { status: 500, body: { code: 'INTERNAL', message: 'erro' } }
          : { status: 200, body: [REPORT] };
      },
    });
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os relatórios emitidos.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect((await screen.findAllByText('01/01/2025 a 30/06/2025')).length).toBeGreaterThan(0);
  });

  it('falha na geracao mostra o motivo e permite tentar de novo', async () => {
    let attempts = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [REPORT] }),
      [PDF]: () => {
        attempts += 1;
        return attempts === 1
          ? {
              status: 503,
              body: {
                code: 'REPORT_PDF_FAILED',
                message:
                  'Não foi possível gerar o PDF do relatório agora. Tente de novo em instantes.',
              },
            }
          : { status: 200, body: LINK };
      },
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Baixar PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível gerar o PDF do relatório agora.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByLabelText('SHA-256 do arquivo')).toHaveValue(SHA);
  });
});
