import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Report, ReportPdfLink, ReportPreview } from '@/types/relatorios';
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

type Route = (body?: unknown) => { status: number; body?: unknown };

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
      const parsedBody = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      const result = route(parsedBody);
      return json(result.status, result.body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderSection(instrumentActive = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ProjectReportsSection projectId={PROJECT_ID} instrumentActive={instrumentActive} />
    </QueryClientProvider>,
  );
}

const LIST = `GET /projects/${PROJECT_ID}/reports`;
const PDF = `GET /projects/${PROJECT_ID}/reports/${REPORT.id}/pdf`;
const PREVIEW = `GET /projects/${PROJECT_ID}/report-preview`;
const RECTIFY = `POST /projects/${PROJECT_ID}/reports/${REPORT.id}/rectify`;

describe('ProjectReportsSection', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(401, { code: 'UNAUTHENTICATED', message: 'Sem sessão' })),
    );
  });

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

  it('oferece retificar apenas na versao mais recente para Presidencia e Gestao com instrumento ativo', async () => {
    const v2: Report = {
      ...REPORT,
      id: '00000000-0000-4000-8000-000000000402',
      versao: 2,
      relatorioAnteriorId: REPORT.id,
      motivoRetificacao: 'Revisão de metas.',
    };
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [v2, REPORT] }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    expect(await screen.findByRole('menuitem', { name: 'Baixar PDF' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Retificar relatório' })).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 2',
      }),
    );
    expect(
      await screen.findByRole('menuitem', { name: 'Retificar relatório' }),
    ).toBeInTheDocument();
  });

  it('oculta a acao de retificar para outros perfis ou quando o instrumento esta inativo', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      [LIST]: () => ({ status: 200, body: [REPORT] }),
    });
    renderSection(true);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    expect(await screen.findByRole('menuitem', { name: 'Baixar PDF' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Retificar relatório' })).not.toBeInTheDocument();

    cleanup();
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [REPORT] }),
    });
    renderSection(false);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    expect(await screen.findByRole('menuitem', { name: 'Baixar PDF' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Retificar relatório' })).not.toBeInTheDocument();
  });

  it('exige motivo e nova justificativa quando resultado mudou, emitindo nova versao preservando a v1', async () => {
    const reportComMeta: Report = {
      ...REPORT,
      metas: [
        {
          id: 'rm-1',
          metaId: 'meta-1',
          resultadoMetaId: 'res-antigo',
          metaOrdem: 1,
          metaOrigem: 'PROJETO',
          metaObjetivo: 'Oficinas culturais',
          metaDescricao: 'Realizar oficinas no semestre',
          metaIndicador: 'Jovens atendidos',
          modalidadeAfericao: 'QUANTITATIVA',
          unidade: 'jovens',
          parametroPlanejado: 100,
          valorAlcancado: 50,
          percentual: 50,
          alcance: 'PARCIALMENTE_CUMPRIDA',
          resultadoDataReferencia: '2025-06-15',
          resultadoDescricao: '50 jovens na chamada inicial',
          justificativa: 'Chuva intensa na quinzena inicial.',
        },
      ],
    };

    const previewData: ReportPreview = {
      projeto: {
        id: PROJECT_ID,
        codigo: 'P01',
        titulo: 'Oficinas Culturais',
        instrumentoId: 'inst-1',
        inicio: '2025-01-01',
        fim: '2026-12-31',
      },
      periodo: { from: '2025-01-01', to: '2025-06-30' },
      metas: [
        {
          id: 'meta-1',
          ordem: 1,
          origem: 'PROJETO',
          objetivo: 'Oficinas culturais',
          descricao: 'Realizar oficinas no semestre',
          indicador: 'Jovens atendidos',
          modalidadeAfericao: 'QUANTITATIVA',
          parametroPlanejado: '100',
          unidade: 'jovens',
          periodoInicio: '2025-01-01',
          periodoFim: '2025-06-30',
          situacao: 'EM_ANDAMENTO',
          rascunho: false,
          resultado: {
            id: 'res-novo',
            dataReferencia: '2025-06-28',
            descricao: '80 jovens após conferência de listas físicas',
            valorAlcancado: 80,
            parametroPlanejado: 100,
            percentual: 80,
            alcance: 'PARCIALMENTE_CUMPRIDA',
            registradoPor: { id: 'u2', nome: 'Ana' },
            registradoEm: '2025-06-28T10:00:00.000Z',
          },
          percentual: 80,
          status: 'PARCIALMENTE_CUMPRIDA',
        },
      ],
    };

    let reportsList: Report[] = [reportComMeta];
    let lastRectifyPayload: unknown = null;

    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: reportsList }),
      [PREVIEW]: () => ({ status: 200, body: previewData }),
      [RECTIFY]: (body) => {
        lastRectifyPayload = body;
        const payload = body as {
          motivo: string;
          justificativas?: { metaId: string; texto: string }[];
        };
        if (!payload.justificativas?.length) {
          return {
            status: 422,
            body: {
              code: 'REPORT_FINALIZATION_BLOCKED',
              message:
                'A emissão do relatório foi bloqueada porque há metas sem resultado registrado ou sem justificativa obrigatória.',
              details: {
                pendencias: [
                  {
                    metaId: 'meta-1',
                    ordem: 1,
                    descricao: 'Realizar oficinas no semestre',
                    motivo: 'SEM_JUSTIFICATIVA',
                    alcance: 'PARCIALMENTE_CUMPRIDA',
                    percentual: 80,
                  },
                ],
              },
            },
          };
        }

        const v2: Report = {
          ...reportComMeta,
          id: '00000000-0000-4000-8000-000000000402',
          versao: 2,
          relatorioAnteriorId: reportComMeta.id,
          motivoRetificacao: payload.motivo,
          criadoEm: '2025-07-10T14:00:00.000Z',
        };
        reportsList = [v2, reportComMeta];
        return { status: 201, body: v2 };
      },
    });

    renderSection();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Retificar relatório' }));

    // Exige motivo antes de enviar
    fireEvent.click(await screen.findByRole('button', { name: 'Emitir retificação' }));
    expect(await screen.findByText('Informe o motivo da retificação.')).toBeInTheDocument();

    // Indica que o resultado mudou após a versão 1 e vem com justificativa em branco
    const justificationInput = await screen.findByLabelText('Justificativa da meta 1');
    expect(justificationInput).toHaveValue('');
    expect(
      screen.getByText(
        /Novo resultado apurado após a versão 1: informe a justificativa atualizada/,
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Motivo da retificação'), {
      target: { value: '  Conferência de listas físicas.  ' },
    });

    // Tenta retificar sem justificativa -> 422 REPORT_FINALIZATION_BLOCKED
    fireEvent.click(screen.getByRole('button', { name: 'Emitir retificação' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Retificação bloqueada por pendências',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('80%');

    // Preenche a nova justificativa e emite a versão 2
    fireEvent.change(justificationInput, {
      target: { value: '  Após reposição, restaram 20 vagas ociosas.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Emitir retificação' }));

    expect((await screen.findAllByText('Versão 2')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Versão 1').length).toBeGreaterThan(0);
    expect(lastRectifyPayload).toEqual({
      motivo: 'Conferência de listas físicas.',
      justificativas: [{ metaId: 'meta-1', texto: 'Após reposição, restaram 20 vagas ociosas.' }],
    });
  });

  it('nao vaza mensagem crua do servidor quando ocorre falha 500 ao retificar', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [REPORT] }),
      [PREVIEW]: () => ({
        status: 200,
        body: {
          projeto: {
            id: PROJECT_ID,
            codigo: 'P01',
            titulo: 'Projeto',
            instrumentoId: 'inst-1',
            inicio: '2025-01-01',
            fim: '2026-12-31',
          },
          periodo: { from: '2025-01-01', to: '2025-06-30' },
          metas: [],
        } satisfies ReportPreview,
      }),
      [RECTIFY]: () => ({
        status: 500,
        body: { code: 'INTERNAL', message: 'PrismaClientKnownRequestError: detalhe interno' },
      }),
    });

    renderSection();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do relatório de 01/01/2025 a 30/06/2025, versão 1',
      }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Retificar relatório' }));
    fireEvent.change(await screen.findByLabelText('Motivo da retificação'), {
      target: { value: 'Ajuste formal.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Emitir retificação' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível retificar o relatório. Tente de novo.',
    );
    expect(screen.queryByText(/detalhe interno/)).not.toBeInTheDocument();
  });
});
