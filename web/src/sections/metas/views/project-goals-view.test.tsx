import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument } from '@/types/instrumentos';
import type { Goal } from '@/types/metas';
import type { Project } from '@/types/projetos';
import type { Requirement } from '@/types/requisitos';
import { ProjectGoalsView } from './project-goals-view';

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000101',
  versao: 1,
  tipo: 'PARCERIA',
  orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
  numeroProcesso: '71000.057425/2025-03',
  valorGlobal: '300000.00',
  dataCelebracao: '2025-11-07',
  vigenciaInicio: '2025-12-31',
  vigenciaFim: '2026-07-26',
  ativo: true,
};

const PROJECT: Project = {
  id: '00000000-0000-4000-8000-000000000301',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  codigo: 'P01',
  titulo: 'Oficinas de dança no Setor Comercial Sul',
  coordenador: { id: '00000000-0000-4000-8000-000000000201', nome: 'Ana Pedagógica', ativo: true },
  inicio: '2026-01-05',
  fim: '2026-07-20',
};

const FREQUENCIA: Requirement = {
  id: '00000000-0000-4000-8000-000000000701',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  descricao: 'Frequência mínima de 70% dos participantes',
  referencia: 'TR, item 24.1',
};

const CERTIFICADO: Requirement = {
  id: '00000000-0000-4000-8000-000000000702',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  descricao: 'Certificado para quem concluir a formação',
  referencia: null,
};

const COMPLETA: Goal = {
  id: '00000000-0000-4000-8000-000000000801',
  versao: 2,
  projetoId: PROJECT.id,
  ordem: 1,
  origem: 'EDITAL',
  objetivo: 'Promover a formação artística de jovens',
  descricao: 'Oficinas de dança com 120 participantes',
  indicador: 'Participantes com frequência mínima de 70%',
  modalidadeAfericao: 'QUANTITATIVA',
  parametroPlanejado: '120',
  unidade: 'participantes',
  periodoInicio: '2026-01-05',
  periodoFim: '2026-06-30',
  frequenciaApuracao: 'Mensal',
  formaComprovacao: 'Listas de presença',
  resultadoEsperado: null,
  requisitos: [
    { id: FREQUENCIA.id, referencia: FREQUENCIA.referencia, descricao: FREQUENCIA.descricao },
    { id: CERTIFICADO.id, referencia: null, descricao: CERTIFICADO.descricao },
  ],
  rascunho: false,
  camposFaltantes: [],
};

const RASCUNHO: Goal = {
  ...COMPLETA,
  id: '00000000-0000-4000-8000-000000000802',
  versao: 1,
  ordem: 2,
  origem: 'PROJETO',
  descricao: 'Apresentação pública ao fim das oficinas',
  indicador: null,
  modalidadeAfericao: null,
  parametroPlanejado: null,
  unidade: null,
  periodoInicio: null,
  periodoFim: null,
  frequenciaApuracao: null,
  formaComprovacao: null,
  requisitos: [COMPLETA.requisitos[0]],
  rascunho: true,
  camposFaltantes: ['indicador', 'formaComprovacao', 'periodoInicio', 'periodoFim'],
};

const GOALS = `/projects/${PROJECT.id}/goals`;

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  const calls: { key: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      calls.push({ key, body });
      if (key === 'POST /auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route(body);
      return json(result.status, result.body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function page(
  goals: Goal[],
  extra: Record<string, Route> = {},
  { instrument = INSTRUMENT }: { instrument?: Instrument } = {},
) {
  return {
    [`GET /instruments/${INSTRUMENT.id}`]: () => ({ status: 200, body: instrument }),
    [`GET /projects/${PROJECT.id}`]: () => ({ status: 200, body: PROJECT }),
    [`GET ${GOALS}`]: () => ({ status: 200, body: goals }),
    ...extra,
  };
}

function renderView(instrumentId = INSTRUMENT.id) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <ProjectGoalsView instrumentId={instrumentId} projectId={PROJECT.id} />
      </Toaster>
    </QueryClientProvider>,
  );
}

describe('metas do projeto', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista as metas com o rascunho identificado, sem acoes para quem so consulta', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', page([COMPLETA, RASCUNHO]));
    renderView();

    await screen.findByText('Apresentação pública ao fim das oficinas');
    const [, completa, rascunho] = screen.getAllByRole('row');
    expect(within(completa).queryByText('Rascunho')).not.toBeInTheDocument();
    expect(completa).toHaveTextContent(
      'Requisitos: TR, item 24.1 · Certificado para quem concluir',
    );
    expect(within(completa).getAllByRole('cell')[0]).toHaveTextContent('120 participantes');
    expect(completa).toHaveTextContent('05/01/2026 a 30/06/2026');
    expect(within(rascunho).getByText('Rascunho')).toBeInTheDocument();
    expect(rascunho).toHaveTextContent(
      'Falta: indicador, forma de comprovação, início do período, fim do período.',
    );
    expect(rascunho).toHaveTextContent('Período a definir');
    expect(screen.getByText('Coordenação Ana Pedagógica')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Parceria · Ministério/ })).toHaveAttribute(
      'href',
      `/instrumentos/${INSTRUMENT.id}`,
    );
    expect(screen.queryByRole('button', { name: 'Nova meta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações da meta/ })).not.toBeInTheDocument();
  });

  it('projeto inexistente mostra o aviso e o caminho de volta', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /instruments/${INSTRUMENT.id}`]: () => ({ status: 200, body: INSTRUMENT }),
    });
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent('Projeto não encontrado.');
    expect(screen.getByRole('link', { name: /Parceria · Ministério/ })).toBeInTheDocument();
  });

  it('projeto de outro instrumento aparece como nao encontrado', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', page([COMPLETA]));
    renderView('00000000-0000-4000-8000-000000000999');

    expect(await screen.findByRole('alert')).toHaveTextContent('Projeto não encontrado.');
  });
});
