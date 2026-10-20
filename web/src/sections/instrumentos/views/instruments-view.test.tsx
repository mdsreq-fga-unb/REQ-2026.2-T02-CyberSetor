import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument } from '@/types/instrumentos';
import { InstrumentsView } from './instruments-view';

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

    const table = await screen.findByRole('table', {
      name: 'Editais, emendas e parcerias que financiam os projetos do Instituto.',
    });
    const [, row] = within(table).getAllByRole('row');
    const [instrumento, valor, vigencia, situacao] = within(row).getAllByRole('cell');
    expect(instrumento).toHaveTextContent('Emenda parlamentar · Secretaria de Cultura');
    expect(valor).toHaveTextContent('R$ 150.000,50');
    expect(vigencia).toHaveTextContent('01/04/2026 a 31/03/2027');
    expect(situacao).toHaveTextContent('Ativo');
  });

  it('perfil que so consulta nao ve as acoes de cadastro e edicao', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
    });
    renderView();

    await screen.findByRole('table');
    expect(screen.queryByRole('button', { name: 'Novo instrumento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações do instrumento/ })).not.toBeInTheDocument();
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
    expect(
      screen.getByText('Informe um valor maior que zero, ex.: 150.000,00.'),
    ).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /instruments')).toBe(false);
  });

  it('edita enviando a versao lida e mostra o conflito de versao', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
      [`PATCH /instruments/${EMENDA.id}`]: () => ({
        status: 409,
        body: {
          code: 'VERSION_CONFLICT',
          message: 'O instrumento foi alterado por outra pessoa. Recarregue e tente de novo.',
        },
      }),
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

    expect(await screen.findByRole('alert')).toHaveTextContent('alterado por outra pessoa');
    expect(calls.find((call) => call.key.startsWith('PATCH'))?.body).toMatchObject({
      versao: 3,
      vigenciaFim: '2027-06-30',
      valorGlobal: '150000.50',
    });
  });
});
