import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument } from '@/types/instrumentos';
import { InstrumentsView } from './instruments-view';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const EMENDA: Instrument = {
  id: '00000000-0000-4000-8000-000000000101',
  versao: 3,
  tipo: 'EMENDA',
  orgaoConcedente: 'Secretaria de Cultura',
  numeroProcesso: '00150-1/2026',
  valorGlobal: '150000.50',
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
  ativo: true,
};

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

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <InstrumentsView />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('instrumentos', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista numa tabela com valor em reais e vigencia em datas', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
    });
    renderView();

    await screen.findAllByText(/Secretaria de Cultura/);
    const table = screen.getByRole('table', {
      name: 'Editais, emendas e parcerias que financiam os projetos do Instituto.',
    });
    const [, row] = within(table).getAllByRole('row');
    const [instrumento, valor, vigencia, situacao] = within(row).getAllByRole('cell');
    expect(instrumento).toHaveTextContent('Emenda parlamentar · Secretaria de Cultura');
    expect(valor).toHaveTextContent('R$ 150.000,50');
    expect(vigencia).toHaveTextContent('01/04/2026 a 31/03/2027');
    expect(situacao).toHaveTextContent('Ativo');
  });

  it('perfil que so consulta nao cadastra nem edita, mas abre os projetos', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
    });
    renderView();

    await screen.findAllByText(/Secretaria de Cultura/);
    expect(screen.queryByRole('button', { name: 'Novo instrumento' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Secretaria de Cultura/ })).toHaveAttribute(
      'href',
      `/instrumentos/${EMENDA.id}`,
    );

    fireEvent.click(screen.getByRole('button', { name: /Ações do instrumento/ }));
    const menu = await screen.findByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Projetos']);
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Projetos' }));
    expect(push).toHaveBeenCalledWith(`/instrumentos/${EMENDA.id}`);
  });

  it('cadastra com o valor convertido e avisa processo repetido', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [] }),
      'POST /instruments': () => ({
        status: 201,
        body: { instrumento: EMENDA, numeroProcessoRepetido: true },
      }),
    });
    renderView();

    await screen.findByText('Nenhum instrumento cadastrado');
    fireEvent.click(screen.getAllByRole('button', { name: 'Novo instrumento' })[0]);
    fill('Tipo', 'EMENDA');
    fill('Órgão concedente', 'Secretaria de Cultura');
    fill('Número do processo', '00150-1/2026');
    fill('Valor global (R$)', '150.000,50');
    fill('Data de celebração', '2026-03-10');
    fill('Início da vigência', '2026-04-01');
    fill('Fim da vigência', '2027-03-31');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    expect(
      await screen.findByText('Outro instrumento já usa o processo 00150-1/2026.'),
    ).toBeInTheDocument();
    expect(calls.find((call) => call.key === 'POST /instruments')?.body).toEqual({
      tipo: 'EMENDA',
      orgaoConcedente: 'Secretaria de Cultura',
      numeroProcesso: '00150-1/2026',
      valorGlobal: '150000.50',
      dataCelebracao: '2026-03-10',
      vigenciaInicio: '2026-04-01',
      vigenciaFim: '2027-03-31',
    });
  });

  it('sem instrumentos, mostra o estado vazio com a acao de cadastro', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [] }),
    });
    renderView();

    expect(await screen.findByText('Nenhum instrumento cadastrado')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Novo instrumento' })).toHaveLength(2);
  });

  it('vigencia invertida e valor invalido nao chamam a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [] }),
    });
    renderView();

    await screen.findByText('Nenhum instrumento cadastrado');
    fireEvent.click(screen.getAllByRole('button', { name: 'Novo instrumento' })[0]);
    fill('Valor global (R$)', '0');
    fill('Início da vigência', '2027-01-01');
    fill('Fim da vigência', '2026-01-01');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    expect(
      await screen.findByText('O fim da vigência não pode ser anterior ao início.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe um valor maior que zero.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /instruments')).toBe(false);
  });

  it('perfil sem consulta recebe o aviso na primeira recusa da API', async () => {
    const calls = await signedInAs('CONCEDENTE_AUDITORIA', {
      'GET /instruments': () => ({
        status: 403,
        body: { code: 'FORBIDDEN', message: 'Acesso negado.' },
      }),
    });
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O seu perfil não consulta instrumentos.',
    );
    expect(calls.filter((call) => call.key === 'GET /instruments')).toHaveLength(1);
  });

  it('valor com ponto decimal e recusado no campo, sem chamar a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [] }),
    });
    renderView();

    await screen.findByText('Nenhum instrumento cadastrado');
    fireEvent.click(screen.getAllByRole('button', { name: 'Novo instrumento' })[0]);
    fill('Valor global (R$)', '10.50');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    expect(
      await screen.findByText(
        'Use o formato 150.000,00: ponto para milhar e vírgula para centavos.',
      ),
    ).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /instruments')).toBe(false);
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    let lista = [EMENDA];
    const patches: unknown[] = [];
    const patchPath = ['PATCH /instruments', EMENDA.id].join('/');
    await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: lista }),
      [patchPath]: (body) => {
        patches.push(body);
        if (patches.length === 1) {
          lista = [{ ...EMENDA, versao: 4, orgaoConcedente: 'Secretaria de Cultura do DF' }];
          return {
            status: 409,
            body: {
              code: 'VERSION_CONFLICT',
              message: 'O instrumento foi alterado por outra pessoa. Recarregue e tente de novo.',
            },
          };
        }
        return { status: 200, body: { instrumento: lista[0], numeroProcessoRepetido: false } };
      },
    });
    renderView();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Ações do instrumento do processo 00150-1/2026',
      }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar instrumento' }));
    expect(await screen.findByLabelText('Valor global (R$)')).toHaveValue('150000,50');
    fill('Fim da vigência', '2027-06-30');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Outra pessoa alterou');
    expect(screen.getByLabelText('Órgão concedente')).toHaveValue('Secretaria de Cultura do DF');
    expect(screen.getByLabelText('Fim da vigência')).toHaveValue('2027-03-31');

    fill('Fim da vigência', '2027-06-30');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    expect(await screen.findByText('Instrumento salvo')).toBeInTheDocument();
    expect(patches[0]).toMatchObject({ versao: 3, vigenciaFim: '2027-06-30' });
    expect(patches[1]).toMatchObject({
      versao: 4,
      vigenciaFim: '2027-06-30',
      orgaoConcedente: 'Secretaria de Cultura do DF',
      valorGlobal: '150000.50',
    });
  });
});
