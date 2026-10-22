import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import { InstrumentProjectsView } from './instrument-projects-view';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000101',
  versao: 1,
  tipo: 'EMENDA',
  orgaoConcedente: 'Secretaria de Cultura',
  numeroProcesso: '00150-1/2026',
  valorGlobal: '150000.50',
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
  ativo: true,
};

const ANA = { id: '00000000-0000-4000-8000-000000000201', nome: 'Ana Pedagógica' };
const BIA = { id: '00000000-0000-4000-8000-000000000202', nome: 'Beatriz Gestão' };

const DANCA: Project = {
  id: '00000000-0000-4000-8000-000000000301',
  versao: 2,
  instrumentoId: INSTRUMENT.id,
  codigo: 'P01',
  titulo: 'Oficinas de dança',
  coordenador: { ...ANA, ativo: true },
  inicio: '2026-05-01',
  fim: '2026-12-15',
};

const BASE = `/instruments/${INSTRUMENT.id}`;

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route> = {}) {
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

function page(instrument: Instrument, projects: Project[], extra: Record<string, Route> = {}) {
  return {
    [`GET ${BASE}`]: () => ({ status: 200, body: instrument }),
    [`GET ${BASE}/projects`]: () => ({ status: 200, body: projects }),
    [`GET ${BASE}/requirements`]: () => ({ status: 200, body: [] }),
    'GET /projects/eligible-coordinators': () => ({ status: 200, body: [ANA, BIA] }),
    ...extra,
  };
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <InstrumentProjectsView instrumentId={INSTRUMENT.id} />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValid() {
  fill('Código', 'P02');
  fill('Título', 'Cineclube itinerante');
  fill('Coordenação', BIA.id);
  fill('Início da execução', '2026-06-01');
  fill('Fim da execução', '2027-01-31');
}

async function openNew() {
  fireEvent.click((await screen.findAllByRole('button', { name: 'Novo projeto' }))[0]);
  await screen.findByRole('option', { name: BIA.nome });
}

describe('projetos do instrumento', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista os projetos com coordenacao e execucao, sem acoes para quem so consulta', async () => {
    const desativada = {
      ...DANCA,
      id: '00000000-0000-4000-8000-000000000302',
      codigo: 'P02',
      coordenador: { id: 'x', nome: 'Fábio', ativo: false },
    };
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', page(INSTRUMENT, [DANCA, desativada]));
    renderView();

    const table = await screen.findByRole('table', {
      name: 'Projetos do instrumento do processo 00150-1/2026.',
    });
    const [, first, second] = within(table).getAllByRole('row');
    const [projeto, coordenacao, execucao] = within(first).getAllByRole('cell');
    expect(projeto).toHaveTextContent('P01');
    expect(projeto).toHaveTextContent('Oficinas de dança');
    expect(coordenacao).toHaveTextContent('Ana Pedagógica');
    expect(execucao).toHaveTextContent('01/05/2026 a 15/12/2026');
    expect(within(second).getAllByText('Conta desativada')[0]).toBeInTheDocument();
    expect(screen.getByText('Vigência 01/04/2026 a 31/03/2027')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Novo projeto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações do projeto/ })).not.toBeInTheDocument();
    expect(within(projeto).getByRole('link', { name: 'P01' })).toHaveAttribute(
      'href',
      `/instrumentos/${INSTRUMENT.id}/projetos/${DANCA.id}`,
    );
  });

  it('o menu do projeto leva as metas', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', page(INSTRUMENT, [DANCA]));
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações do projeto P01' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Metas' }));

    expect(push).toHaveBeenCalledWith(`/instrumentos/${INSTRUMENT.id}/projetos/${DANCA.id}`);
  });

  it('instrumento inativo nao oferece cadastro nem edicao', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', page({ ...INSTRUMENT, ativo: false }, [DANCA]));
    renderView();

    expect(
      await screen.findByText(
        'Instrumento inativo: não recebe nem altera requisitos nem projetos.',
      ),
    ).toBeInTheDocument();
    await screen.findByText('Oficinas de dança');
    await screen.findByText('Nenhum requisito neste instrumento');
    expect(screen.queryByRole('button', { name: 'Novo requisito' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Novo projeto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações do projeto/ })).not.toBeInTheDocument();
  });

  it('cadastra o projeto com a coordenacao escolhida', async () => {
    const calls = await signedInAs(
      'PRESIDENCIA_GESTAO',
      page(INSTRUMENT, [], {
        [`POST ${BASE}/projects`]: () => ({ status: 201, body: { ...DANCA, codigo: 'P02' } }),
      }),
    );
    renderView();

    await screen.findByText('Nenhum projeto neste instrumento');
    await openNew();
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText('Projeto P02 salvo')).toBeInTheDocument();
    expect(calls.find((call) => call.key === `POST ${BASE}/projects`)?.body).toEqual({
      codigo: 'P02',
      titulo: 'Cineclube itinerante',
      coordenadorId: BIA.id,
      inicio: '2026-06-01',
      fim: '2027-01-31',
    });
  });

  it('formulario incompleto ou fora da vigencia nao chama a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', page(INSTRUMENT, []));
    renderView();

    await openNew();
    fill('Início da execução', '2026-03-01');
    fill('Fim da execução', '2027-05-01');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText('Informe o código.')).toBeInTheDocument();
    expect(screen.getByText('Escolha a coordenação.')).toBeInTheDocument();
    expect(
      screen.getByText('A execução começa dentro da vigência, de 01/04/2026 a 31/03/2027.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A execução termina dentro da vigência, de 01/04/2026 a 31/03/2027.'),
    ).toBeInTheDocument();
    expect(calls.some((call) => call.key === `POST ${BASE}/projects`)).toBe(false);
  });

  it('codigo repetido recusado pela API aparece no campo do codigo', async () => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page(INSTRUMENT, [], {
        [`POST ${BASE}/projects`]: () => ({
          status: 409,
          body: {
            code: 'PROJECT_CODE_TAKEN',
            message: 'Já existe projeto com este código no instrumento.',
          },
        }),
      }),
    );
    renderView();

    await openNew();
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(
      await screen.findByText('Já existe projeto com este código no instrumento.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Código')).toHaveAttribute('aria-invalid', 'true');
  });

  it('coordenacao desativada aparece indisponivel na edicao', async () => {
    const projeto = { ...DANCA, coordenador: { id: 'x', nome: 'Fábio', ativo: false } };
    await signedInAs('PRESIDENCIA_GESTAO', page(INSTRUMENT, [projeto]));
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações do projeto P01' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar projeto' }));

    expect(await screen.findByRole('option', { name: 'Fábio (conta desativada)' })).toBeDisabled();
    expect(screen.getByLabelText('Coordenação')).toHaveValue('x');
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    const patches: unknown[] = [];
    const fresh = { ...DANCA, versao: 5, titulo: 'Oficinas de dança e teatro' };
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page(INSTRUMENT, [DANCA], {
        [`GET /projects/${DANCA.id}`]: () => ({ status: 200, body: fresh }),
        [`PATCH /projects/${DANCA.id}`]: (body) => {
          patches.push(body);
          return patches.length === 1
            ? {
                status: 409,
                body: { code: 'VERSION_CONFLICT', message: 'O projeto foi alterado.' },
              }
            : { status: 200, body: { ...fresh, versao: 6 } };
        },
      }),
    );
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações do projeto P01' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar projeto' }));
    await screen.findByRole('option', { name: BIA.nome });
    fill('Fim da execução', '2027-02-28');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText(/Outra pessoa alterou este projeto/)).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Oficinas de dança e teatro');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText('Projeto P01 salvo')).toBeInTheDocument();
    expect(patches[1]).toMatchObject({ versao: 5, titulo: 'Oficinas de dança e teatro' });
  });

  it('vigencia encurtada nao trava a edicao sem mudanca de data, como na API', async () => {
    const patches: unknown[] = [];
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page({ ...INSTRUMENT, vigenciaFim: '2026-10-31' }, [DANCA], {
        [`PATCH /projects/${DANCA.id}`]: (body) => {
          patches.push(body);
          return { status: 200, body: { ...DANCA, versao: 3, titulo: 'Dança no SCS' } };
        },
      }),
    );
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações do projeto P01' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar projeto' }));
    await screen.findByRole('option', { name: BIA.nome });
    fill('Fim da execução', '2026-12-20');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(
      await screen.findByText('A execução termina dentro da vigência, de 01/04/2026 a 31/10/2026.'),
    ).toBeInTheDocument();
    expect(patches).toHaveLength(0);

    fill('Fim da execução', DANCA.fim);
    fill('Título', 'Dança no SCS');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText('Projeto P01 salvo')).toBeInTheDocument();
    expect(patches[0]).toMatchObject({ versao: 2, titulo: 'Dança no SCS', fim: DANCA.fim });
  });

  it('recusa da API por vigencia alterada marca o fim quando o inicio esta dentro', async () => {
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      page(INSTRUMENT, [], {
        [`POST ${BASE}/projects`]: () => ({
          status: 400,
          body: {
            code: 'OUTSIDE_INSTRUMENT_TERM',
            message: 'A execução deve ficar dentro da vigência do instrumento.',
          },
        }),
      }),
    );
    renderView();

    await openNew();
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(
      await screen.findByText('A execução deve ficar dentro da vigência do instrumento.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Fim da execução')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Início da execução')).toHaveAttribute('aria-invalid', 'false');
  });

  it('instrumento inexistente mostra o aviso e o caminho de volta', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {});
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent('Instrumento não encontrado.');
    expect(screen.getByRole('link', { name: 'Instrumentos' })).toHaveAttribute(
      'href',
      '/instrumentos',
    );
  });
});
