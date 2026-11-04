import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Perfil } from '@/auth/types';
import { Toaster } from '@/components/ui/toast';
import type { FinalizeReportInput, Report, ReportPreview } from '@/types/relatorios';
import { ProjectReportPreviewSection } from './project-report-preview-section';

const PROJECT_ID = '00000000-0000-4000-8000-000000000301';

const MOCK_PREVIEW: ReportPreview = {
  projeto: {
    id: PROJECT_ID,
    codigo: 'P01',
    titulo: 'Oficinas de Dança',
    instrumentoId: '00000000-0000-4000-8000-000000000101',
    inicio: '2026-01-01',
    fim: '2026-12-31',
  },
  periodo: {
    from: '2026-01-01',
    to: '2026-06-30',
  },
  metas: [
    {
      id: 'meta-1',
      ordem: 1,
      origem: 'PROJETO',
      objetivo: 'Capacitar jovens',
      descricao: 'Capacitar jovens em dança contemporânea',
      indicador: 'Jovens certificados',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '100',
      unidade: 'jovens',
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      situacao: 'CONCLUIDA',
      rascunho: false,
      resultado: {
        id: 'res-1',
        dataReferencia: '2026-06-30',
        descricao: 'Turma concluída com 120 alunos',
        valorAlcancado: 120,
        parametroPlanejado: 100,
        percentual: 120,
        alcance: 'CUMPRIDA',
        registradoPor: { id: 'usr-1', nome: 'Coordenadora Ana' },
        registradoEm: '2026-06-30T10:00:00.000Z',
      },
      percentual: 120,
      status: 'CUMPRIDA',
    },
    {
      id: 'meta-2',
      ordem: 2,
      origem: 'PROJETO',
      objetivo: 'Oficinas de ritmo',
      descricao: 'Oficinas em escolas públicas',
      indicador: 'Oficinas ministradas',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '10',
      unidade: 'oficinas',
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      situacao: 'EM_ANDAMENTO',
      rascunho: false,
      resultado: {
        id: 'res-2',
        dataReferencia: '2026-06-20',
        descricao: '5 oficinas concluídas',
        valorAlcancado: 5,
        parametroPlanejado: 10,
        percentual: 50,
        alcance: 'PARCIALMENTE_CUMPRIDA',
        registradoPor: { id: 'usr-1', nome: 'Coordenadora Ana' },
        registradoEm: '2026-06-20T10:00:00.000Z',
      },
      percentual: 50,
      status: 'PARCIALMENTE_CUMPRIDA',
    },
    {
      id: 'meta-3',
      ordem: 3,
      origem: 'PROJETO',
      objetivo: 'Aplicativo de dança',
      descricao: 'Lançar app móvel',
      indicador: 'App na loja',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '1',
      unidade: 'app',
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      situacao: 'PENDENTE',
      rascunho: false,
      resultado: {
        id: 'res-3',
        dataReferencia: '2026-06-30',
        descricao: 'Atrasado',
        valorAlcancado: 0,
        parametroPlanejado: 1,
        percentual: 0,
        alcance: 'NAO_CUMPRIDA',
        registradoPor: { id: 'usr-1', nome: 'Coordenadora Ana' },
        registradoEm: '2026-06-30T10:00:00.000Z',
      },
      percentual: 0,
      status: 'NAO_CUMPRIDA',
    },
    {
      id: 'meta-4',
      ordem: 4,
      origem: 'PROJETO',
      objetivo: 'Articulação comunitária',
      descricao: 'Encontros mensais',
      indicador: 'Encontros',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '6',
      unidade: 'encontros',
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      situacao: 'PENDENTE',
      rascunho: true,
      resultado: null,
      percentual: null,
      status: null,
    },
    {
      id: 'meta-5',
      ordem: 5,
      origem: 'PROJETO',
      objetivo: 'Selo de transparência',
      descricao: 'Conquistar selo de integridade',
      indicador: 'Certificado',
      modalidadeAfericao: 'QUALITATIVA',
      parametroPlanejado: null,
      unidade: null,
      periodoInicio: '2026-01-01',
      periodoFim: '2026-06-30',
      situacao: 'CONCLUIDA',
      rascunho: false,
      resultado: {
        id: 'res-5',
        dataReferencia: '2026-06-15',
        descricao: 'Selo obtido com louvor',
        valorAlcancado: null,
        parametroPlanejado: null,
        percentual: null,
        alcance: 'CUMPRIDA',
        registradoPor: { id: 'usr-1', nome: 'Coordenadora Ana' },
        registradoEm: '2026-06-15T10:00:00.000Z',
      },
      percentual: null,
      status: 'CUMPRIDA',
    },
  ],
};

function buildEmittedReport(justificativas: FinalizeReportInput['justificativas'] = []): Report {
  const byMetaId = new Map(justificativas.map((j) => [j.metaId, j.texto]));
  return {
    id: 'rel-1',
    projetoId: PROJECT_ID,
    versao: 1,
    periodoInicio: '2026-01-01',
    periodoFim: '2026-06-30',
    relatorioAnteriorId: null,
    motivoRetificacao: null,
    emitidoPor: { id: 'usr-gestao', nome: 'Diretora Helena' },
    criadoEm: '2026-07-01T14:30:00.000Z',
    pdf: null,
    metas: MOCK_PREVIEW.metas
      .filter((m) => !m.rascunho && m.resultado && m.status)
      .map((m) => ({
        id: `rm-${m.id}`,
        metaId: m.id,
        resultadoMetaId: m.resultado!.id,
        metaOrdem: m.ordem,
        metaOrigem: m.origem,
        metaObjetivo: m.objetivo,
        metaDescricao: m.descricao,
        metaIndicador: m.indicador,
        modalidadeAfericao: m.modalidadeAfericao,
        unidade: m.unidade,
        parametroPlanejado: m.resultado!.parametroPlanejado,
        valorAlcancado: m.resultado!.valorAlcancado,
        percentual: m.percentual,
        alcance: m.status!,
        resultadoDataReferencia: m.resultado!.dataReferencia,
        resultadoDescricao: m.resultado!.descricao,
        justificativa: byMetaId.get(m.id) ?? null,
      })),
  };
}

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderComponent(props: { instrumentActive?: boolean } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Toaster>
        <ProjectReportPreviewSection projectId={PROJECT_ID} {...props} />
      </Toaster>
    </QueryClientProvider>,
  );
}

function selectPeriod(from = '2026-01-01', to = '2026-06-30') {
  fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: from } });
  fireEvent.change(screen.getByLabelText('Data final'), { target: { value: to } });
}

describe('ProjectReportPreviewSection', () => {
  // Sem sessão, a tela tenta renovar o login: a resposta fica no teste, sem rede de verdade.
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
    window.localStorage.clear();
  });

  it('exibe estado vazio orientando a escolher um intervalo quando as datas não foram preenchidas', () => {
    renderComponent();

    expect(screen.getByText('Relatório de Execução do Objeto')).toBeInTheDocument();
    expect(screen.getByText('Nenhum período selecionado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Escolha a data inicial e final acima para visualizar a prévia das metas do relatório.',
      ),
    ).toBeInTheDocument();
  });

  it('avisa quando a data inicial é posterior à data final e bloqueia a chamada à API', () => {
    const fetchSpy = vi.fn<(url: string) => Promise<Response>>(async () =>
      json(401, { code: 'UNAUTHENTICATED', message: 'Sem sessão' }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    renderComponent();

    selectPeriod('2026-06-30', '2026-01-01');

    expect(
      screen.getByText('A data inicial não pode ser posterior à data final.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Intervalo de datas inválido')).toBeInTheDocument();
    expect(fetchSpy.mock.calls.map(([url]) => String(url))).not.toContainEqual(
      expect.stringContaining('/report-preview'),
    );
  });

  it('renderiza a tabela de metas com cumprimento e badges correspondentes após preencher o período', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, MOCK_PREVIEW);
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');

    renderComponent();
    selectPeriod();

    // Meta 1: Cumprida com 120%
    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();
    expect(screen.getByText('120%')).toBeInTheDocument();
    expect(screen.getAllByText('Cumprida')).toHaveLength(2);

    // Meta 2: Parcialmente cumprida com 50% e sinalizada sem justificativa
    expect(screen.getByText('Oficinas de ritmo')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente cumprida')).toBeInTheDocument();

    // Meta 3: Não cumprida com 0% e sinalizada sem justificativa
    expect(screen.getByText('Aplicativo de dança')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Não cumprida')).toBeInTheDocument();
    expect(screen.getAllByText('Sem justificativa')).toHaveLength(2);

    // Meta 4: rascunho fica fora da apuração (RN-02)
    expect(screen.getByText('Articulação comunitária')).toBeInTheDocument();
    expect(screen.getByText('Rascunho, fora da apuração')).toBeInTheDocument();

    // Meta 5: Qualitativa cumprida
    expect(screen.getByText('Selo de transparência')).toBeInTheDocument();
    expect(screen.getByText('Selo obtido com louvor (em 15/06/2026)')).toBeInTheDocument();

    // Cabeçalhos
    expect(screen.getByRole('columnheader', { name: 'Percentual' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Cumprimento' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Metas do projeto no período/ })).toBeInTheDocument();
  });

  it('bloqueia tentativa de finalizar com pendência (422), abre campos de justificativa e aprova após preenchê-las', async () => {
    const finalizeCalls: FinalizeReportInput[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, MOCK_PREVIEW);
        }

        if (method === 'POST' && path === `/projects/${PROJECT_ID}/reports/finalize`) {
          const payload = JSON.parse(String(init.body ?? '{}')) as FinalizeReportInput;
          finalizeCalls.push(payload);
          const sentIds = new Set((payload.justificativas ?? []).map((item) => item.metaId));
          const pending = [
            ...(!sentIds.has('meta-2')
              ? [
                  {
                    metaId: 'meta-2',
                    ordem: 2,
                    descricao: 'Oficinas em escolas públicas',
                    motivo: 'SEM_JUSTIFICATIVA',
                    alcance: 'PARCIALMENTE_CUMPRIDA',
                    percentual: 50,
                  },
                ]
              : []),
            ...(!sentIds.has('meta-3')
              ? [
                  {
                    metaId: 'meta-3',
                    ordem: 3,
                    descricao: 'Lançar app móvel',
                    motivo: 'SEM_JUSTIFICATIVA',
                    alcance: 'NAO_CUMPRIDA',
                    percentual: 0,
                  },
                ]
              : []),
          ];

          if (pending.length > 0) {
            return json(422, {
              code: 'REPORT_FINALIZATION_BLOCKED',
              message: `Há ${pending.length} metas pendentes que impedem a finalização do relatório`,
              correlationId: 'corr-422',
              details: { pendencias: pending },
            });
          }

          return json(201, buildEmittedReport(payload.justificativas));
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();

    // 1. Tentativa de finalizar sem justificativas -> rejeição 422
    const finalizeButton = screen.getByRole('button', { name: 'Finalizar relatório' });
    fireEvent.click(finalizeButton);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Finalização do relatório bloqueada')).toBeInTheDocument();
    expect(within(alert).getByText(/Meta 2 \(Oficinas em escolas públicas\)/)).toBeInTheDocument();
    expect(within(alert).getByText(/Meta 3 \(Lançar app móvel\)/)).toBeInTheDocument();
    expect(within(alert).getByText(/demais áreas continuam liberados/)).toBeInTheDocument();

    // Campos de texto abertos somente para as metas não atingidas (2 e 3), não para cumpridas ou rascunho
    const inputMeta2 = screen.getByLabelText('Justificativa da meta 2');
    const inputMeta3 = screen.getByLabelText('Justificativa da meta 3');
    expect(inputMeta2).toHaveAttribute('aria-invalid', 'true');
    expect(inputMeta3).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByLabelText('Justificativa da meta 1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Justificativa da meta 4')).not.toBeInTheDocument();

    // Enquanto houver justificativa pendente, a finalização permanece bloqueada
    expect(finalizeButton).toBeDisabled();

    // 2. Preenche apenas a meta 2 -> meta 3 ainda bloqueia
    fireEvent.change(inputMeta2, {
      target: { value: '  Reforma em duas escolas adiou cinco oficinas para o 2º semestre.  ' },
    });
    expect(inputMeta2).toHaveAttribute('aria-invalid', 'false');
    expect(
      within(screen.getByRole('alert')).queryByText(/Meta 2 \(Oficinas em escolas públicas\)/),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('alert')).getByText(/Meta 3 \(Lançar app móvel\)/),
    ).toBeInTheDocument();
    expect(finalizeButton).toBeDisabled();

    // 3. Preenche também a meta 3 -> finalização é liberada
    fireEvent.change(inputMeta3, {
      target: { value: 'Fornecedor atrasou homologação na loja de aplicativos.' },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Todas as justificativas pendentes foram preenchidas\. A finalização do relatório está liberada\./,
      ),
    ).toBeInTheDocument();
    expect(finalizeButton).not.toBeDisabled();

    // 4. Nova submissão -> aprovação 201 com textos aparados
    fireEvent.click(finalizeButton);

    await waitFor(() => {
      expect(screen.getByText('Relatório finalizado — Versão 1')).toBeInTheDocument();
    });
    expect(screen.getByText(/Emitido por Diretora Helena/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Justificativa registrada: Reforma em duas escolas adiou cinco oficinas para o 2º semestre\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Justificativa registrada: Fornecedor atrasou homologação na loja de aplicativos\./,
      ),
    ).toBeInTheDocument();

    expect(finalizeCalls).toEqual([
      { from: '2026-01-01', to: '2026-06-30' },
      {
        from: '2026-01-01',
        to: '2026-06-30',
        justificativas: [
          {
            metaId: 'meta-2',
            texto: 'Reforma em duas escolas adiou cinco oficinas para o 2º semestre.',
          },
          {
            metaId: 'meta-3',
            texto: 'Fornecedor atrasou homologação na loja de aplicativos.',
          },
        ],
      },
    ]);
  });

  it('mantém bloqueio visível quando há meta ativa sem resultado registrado no período (CA-05a.7)', async () => {
    const previewWithoutResult: ReportPreview = {
      ...MOCK_PREVIEW,
      metas: [
        MOCK_PREVIEW.metas[0],
        {
          ...MOCK_PREVIEW.metas[1],
          resultado: null,
          percentual: null,
          status: null,
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, previewWithoutResult);
        }

        if (method === 'POST' && path === `/projects/${PROJECT_ID}/reports/finalize`) {
          return json(422, {
            code: 'REPORT_FINALIZATION_BLOCKED',
            message: 'Há 1 meta pendente que impede a finalização do relatório',
            correlationId: 'corr-sem-res',
            details: {
              pendencias: [
                {
                  metaId: 'meta-2',
                  ordem: 2,
                  descricao: 'Oficinas em escolas públicas',
                  motivo: 'SEM_RESULTADO_REGISTRADO',
                  alcance: null,
                  percentual: null,
                },
              ],
            },
          });
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByText('Sem resultado no período')).toBeInTheDocument();

    const finalizeButton = screen.getByRole('button', { name: 'Finalizar relatório' });
    fireEvent.click(finalizeButton);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Meta 2 (Oficinas em escolas públicas): sem resultado registrado no período.',
    );
    expect(finalizeButton).toBeDisabled();
  });

  it('notifica a coordenação pedagógica sobre pendências sem expor o botão de emissão, e oculta emissão para instrumento inativo', async () => {
    let activePerfil: Perfil = 'NUCLEO_PEDAGOGICO';

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: `token-${activePerfil}`,
            perfil: activePerfil,
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, MOCK_PREVIEW);
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('coord@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();
    expect(
      screen.getByText('Pendências para finalização do relatório neste período'),
    ).toBeInTheDocument();
    expect(screen.getByText(/demais áreas continuam liberados/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finalizar relatório' })).not.toBeInTheDocument();

    cleanup();
    clearLocalSession();

    activePerfil = 'PRESIDENCIA_GESTAO';
    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent({ instrumentActive: false });
    selectPeriod();

    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();
    expect(
      screen.getByText('Instrumento inativo: não permite finalizar relatórios.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finalizar relatório' })).not.toBeInTheDocument();
  });

  it('falha inesperada da previa mostra a mensagem padrao, sem o texto cru do servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const path = new URL(url).pathname.replace(/^\/v1/, '');
        if ((init.method ?? 'GET') === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }
        return json(500, { code: 'INTERNAL', message: 'TypeError: detalhe interno' });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a prévia do relatório. Tente de novo.',
    );
    expect(screen.queryByText(/detalhe interno/)).not.toBeInTheDocument();
  });

  it('exibe erro retornado pela API quando o período já foi finalizado ou ainda não encerrou', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, { ...MOCK_PREVIEW, metas: [MOCK_PREVIEW.metas[0]] });
        }

        if (method === 'POST' && path === `/projects/${PROJECT_ID}/reports/finalize`) {
          return json(409, {
            code: 'REPORT_ALREADY_FINALIZED',
            message:
              'O relatório deste período já foi finalizado. Para corrigir, utilize a retificação.',
            correlationId: 'corr-409',
          });
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar relatório' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O relatório deste período já foi finalizado. Para corrigir, utilize a retificação.',
    );
  });

  it('permite abrir os campos de justificativa proativamente e emitir direto sem passar por erro 422', async () => {
    let submitted: FinalizeReportInput | null = null;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.replace(/^\/v1/, '');
        const method = init.method ?? 'GET';

        if (method === 'POST' && path === '/auth/login') {
          return json(200, {
            accessToken: 'token-teste',
            perfil: 'PRESIDENCIA_GESTAO',
            deveTrocarSenha: false,
          });
        }

        if (method === 'GET' && path === `/projects/${PROJECT_ID}/report-preview`) {
          return json(200, MOCK_PREVIEW);
        }

        if (method === 'POST' && path === `/projects/${PROJECT_ID}/reports/finalize`) {
          submitted = JSON.parse(String(init.body ?? '{}')) as FinalizeReportInput;
          return json(201, buildEmittedReport(submitted.justificativas));
        }

        return json(404, { code: 'NOT_FOUND', message: `${method} ${path}` });
      }),
    );

    await signIn('gestao@instituto.org.br', 'senha-longa');
    renderComponent();
    selectPeriod();

    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Informar justificativas' }));

    fireEvent.change(screen.getByLabelText('Justificativa da meta 2'), {
      target: { value: 'Oficinas reprogramadas por calendário escolar.' },
    });
    fireEvent.change(screen.getByLabelText('Justificativa da meta 3'), {
      target: { value: 'Publicação pendente de revisão jurídica.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Finalizar relatório' }));

    expect(await screen.findByText('Relatório finalizado — Versão 1')).toBeInTheDocument();
    expect(submitted).toEqual({
      from: '2026-01-01',
      to: '2026-06-30',
      justificativas: [
        { metaId: 'meta-2', texto: 'Oficinas reprogramadas por calendário escolar.' },
        { metaId: 'meta-3', texto: 'Publicação pendente de revisão jurídica.' },
      ],
    });
  });
});
