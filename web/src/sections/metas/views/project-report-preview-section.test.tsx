import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { ReportPreview } from '@/types/relatorios';
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

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectReportPreviewSection projectId={PROJECT_ID} />
    </QueryClientProvider>,
  );
}

describe('ProjectReportPreviewSection', () => {
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
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderComponent();

    const fromInput = screen.getByLabelText('Data inicial');
    const toInput = screen.getByLabelText('Data final');

    fireEvent.change(fromInput, { target: { value: '2026-06-30' } });
    fireEvent.change(toInput, { target: { value: '2026-01-01' } });

    expect(
      screen.getByText('A data inicial não pode ser posterior à data final.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Intervalo de datas inválido')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
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

    const fromInput = screen.getByLabelText('Data inicial');
    const toInput = screen.getByLabelText('Data final');

    fireEvent.change(fromInput, { target: { value: '2026-01-01' } });
    fireEvent.change(toInput, { target: { value: '2026-06-30' } });

    // Meta 1: Cumprida com 120%
    expect(await screen.findByText('Capacitar jovens')).toBeInTheDocument();
    expect(screen.getByText('120%')).toBeInTheDocument();
    expect(screen.getAllByText('Cumprida')).toHaveLength(2);

    // Meta 2: Parcialmente cumprida com 50%
    expect(screen.getByText('Oficinas de ritmo')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente cumprida')).toBeInTheDocument();

    // Meta 3: Não cumprida com 0%
    expect(screen.getByText('Aplicativo de dança')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Não cumprida')).toBeInTheDocument();

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
});
