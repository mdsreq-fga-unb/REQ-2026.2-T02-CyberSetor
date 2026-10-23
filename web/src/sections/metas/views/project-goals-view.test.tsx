import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
  {
    instrument = INSTRUMENT,
    requirements = [FREQUENCIA, CERTIFICADO],
  }: { instrument?: Instrument; requirements?: Requirement[] } = {},
) {
  return {
    [`GET /instruments/${INSTRUMENT.id}`]: () => ({ status: 200, body: instrument }),
    [`GET /instruments/${INSTRUMENT.id}/requirements`]: () => ({
      status: 200,
      body: requirements,
    }),
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

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function openNew() {
  const [button] = await screen.findAllByRole('button', { name: 'Nova meta' });
  await vi.waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await screen.findByRole('dialog');
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

  it('cadastra a meta com os requisitos marcados e os parametros de afericao', async () => {
    const calls = await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([], { [`POST ${GOALS}`]: () => ({ status: 201, body: { ...COMPLETA, ordem: 1 } }) }),
    );
    renderView();

    await openNew();
    fill('Origem', 'EDITAL');
    fill('Objetivo', 'Promover a formação artística de jovens');
    fill('Descrição', 'Oficinas de dança com 120 participantes');
    fireEvent.click(screen.getByRole('checkbox', { name: /TR, item 24.1/ }));
    fill('Indicador', 'Participantes com frequência mínima de 70%');
    fill('Modalidade', 'QUANTITATIVA');
    fill('Parâmetro planejado', '120');
    fill('Início', '2026-01-05');
    fill('Fim (prazo)', '2026-06-30');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(await screen.findByText('Meta 1 salva')).toBeInTheDocument();
    expect(calls.find((call) => call.key === `POST ${GOALS}`)?.body).toEqual({
      origem: 'EDITAL',
      objetivo: 'Promover a formação artística de jovens',
      descricao: 'Oficinas de dança com 120 participantes',
      requisitoIds: [FREQUENCIA.id],
      indicador: 'Participantes com frequência mínima de 70%',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '120',
      unidade: '',
      periodoInicio: '2026-01-05',
      periodoFim: '2026-06-30',
      frequenciaApuracao: '',
      formaComprovacao: '',
      resultadoEsperado: '',
    });
  });

  it('formulario sem origem, objetivo ou com fim antes do inicio nao chama a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', page([]));
    renderView();

    await openNew();
    fill('Início', '2026-06-01');
    fill('Fim (prazo)', '2026-05-31');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(await screen.findByText('Escolha a origem da meta.')).toBeInTheDocument();
    expect(screen.getByText('Informe o objetivo.')).toBeInTheDocument();
    expect(
      screen.getByText('O fim do período não pode ser anterior ao início.'),
    ).toBeInTheDocument();
    expect(calls.some((call) => call.key === `POST ${GOALS}`)).toBe(false);
  });

  it('periodo fora da execucao do projeto nao chama a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', page([]));
    renderView();

    await openNew();
    expect(
      screen.getByText('Dentro da execução do projeto, de 05/01/2026 a 20/07/2026.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Início')).toHaveAttribute('min', '2026-01-05');
    expect(screen.getByLabelText('Fim (prazo)')).toHaveAttribute('max', '2026-07-20');
    fill('Origem', 'EDITAL');
    fill('Objetivo', 'Ampliar o público');
    fill('Descrição', 'Apresentação aberta');
    fill('Início', '2026-01-04');
    fill('Fim (prazo)', '2026-07-21');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(
      await screen.findAllByText(
        'Escolha uma data dentro da execução do projeto, de 05/01/2026 a 20/07/2026.',
      ),
    ).toHaveLength(2);
    expect(calls.some((call) => call.key === `POST ${GOALS}`)).toBe(false);
  });

  it.each([
    ['GOAL_REQUIREMENT_REQUIRED', 'Relacione a meta a pelo menos um requisito do instrumento.'],
    [
      'REQUIREMENT_OUTSIDE_INSTRUMENT',
      'Escolha os requisitos entre os do instrumento deste projeto.',
    ],
  ])('recusa %s da API aparece junto dos requisitos', async (code, message) => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([], { [`POST ${GOALS}`]: () => ({ status: 400, body: { code, message } }) }),
    );
    renderView();

    await openNew();
    fill('Origem', 'INSTITUTO');
    fill('Objetivo', 'Ampliar o público');
    fill('Descrição', 'Apresentação aberta');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    const group = await screen.findByRole('group', { name: 'Requisitos do instrumento atendidos' });
    expect(group).toHaveTextContent(message);
    expect(screen.getByRole('checkbox', { name: /TR, item 24.1/ })).toHaveFocus();
  });

  it('recusa do periodo pela API marca o fim do periodo', async () => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([], {
        [`POST ${GOALS}`]: () => ({
          status: 400,
          body: {
            code: 'INVALID_PERIOD',
            message: 'O fim do período não pode ser anterior ao início.',
          },
        }),
      }),
    );
    renderView();

    await openNew();
    fill('Origem', 'EDITAL');
    fill('Objetivo', 'Ampliar o público');
    fill('Descrição', 'Apresentação aberta');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(
      await screen.findByText('O fim do período não pode ser anterior ao início.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Fim (prazo)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sem carregar os requisitos, avisa e nao oferece cadastro nem edicao', async () => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([COMPLETA], {
        [`GET /instruments/${INSTRUMENT.id}/requirements`]: () => ({
          status: 500,
          body: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente.' },
        }),
      }),
    );
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o instrumento e os requisitos dele',
    );
    await screen.findByText('Oficinas de dança com 120 participantes');
    expect(screen.queryByRole('button', { name: 'Nova meta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações da meta/ })).not.toBeInTheDocument();
  });

  it('sem requisitos no instrumento, nao oferece o cadastro e aponta o instrumento', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', page([], {}, { requirements: [] }));
    renderView();

    expect(
      await screen.findByText(/Cadastre os requisitos do instrumento antes das metas/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova meta' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'página do instrumento' })).toHaveAttribute(
      'href',
      `/instrumentos/${INSTRUMENT.id}`,
    );
  });

  it('instrumento inativo nao oferece cadastro nem edicao', async () => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([COMPLETA], {}, { instrument: { ...INSTRUMENT, ativo: false } }),
    );
    renderView();

    expect(
      await screen.findByText('Instrumento inativo: não recebe nem altera metas.'),
    ).toBeInTheDocument();
    await screen.findByText('Oficinas de dança com 120 participantes');
    expect(screen.queryByRole('button', { name: 'Nova meta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações da meta/ })).not.toBeInTheDocument();
  });

  it('edita a meta, apaga indicador, modalidade e prazo, e envia a versao lida', async () => {
    const calls = await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([COMPLETA], {
        [`PATCH /goals/${COMPLETA.id}`]: () => ({ status: 200, body: { ...COMPLETA, versao: 3 } }),
      }),
    );
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações da meta 1' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar meta' }));
    expect(screen.getByRole('checkbox', { name: /Certificado/ })).toBeChecked();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fill('Indicador', '');
    expect(screen.getByRole('status')).toHaveTextContent('Ao salvar, a meta volta a ser rascunho');
    fill('Modalidade', '');
    fill('Fim (prazo)', '');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(await screen.findByText('Meta 1 salva')).toBeInTheDocument();
    expect(calls.find((call) => call.key.startsWith('PATCH'))?.body).toMatchObject({
      versao: 2,
      indicador: '',
      modalidadeAfericao: null,
      periodoInicio: COMPLETA.periodoInicio,
      periodoFim: null,
      requisitoIds: [FREQUENCIA.id, CERTIFICADO.id],
    });
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    const patches: unknown[] = [];
    const fresh = { ...COMPLETA, versao: 5, objetivo: 'Formação artística e cidadã' };
    let lists = 0;
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page([], {
        [`GET ${GOALS}`]: () => ({ status: 200, body: lists++ === 0 ? [COMPLETA] : [fresh] }),
        [`PATCH /goals/${COMPLETA.id}`]: (body) => {
          patches.push(body);
          return patches.length === 1
            ? { status: 409, body: { code: 'VERSION_CONFLICT', message: 'A meta foi alterada.' } }
            : { status: 200, body: { ...fresh, versao: 6 } };
        },
      }),
    );
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações da meta 1' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar meta' }));
    fill('Unidade', 'jovens');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(await screen.findByText(/Outra pessoa alterou esta meta/)).toBeInTheDocument();
    expect(screen.getByLabelText('Objetivo')).toHaveValue('Formação artística e cidadã');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar meta' }));

    expect(await screen.findByText('Meta 1 salva')).toBeInTheDocument();
    expect(patches[1]).toMatchObject({ versao: 5, objetivo: 'Formação artística e cidadã' });
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
