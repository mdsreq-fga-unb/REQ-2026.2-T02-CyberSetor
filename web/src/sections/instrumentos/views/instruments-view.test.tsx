import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
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
      <InstrumentsView />
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

  it('lista com valor em reais e vigencia por extenso de data', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
    });
    renderView();

    const item = within(await screen.findByRole('list', { name: 'Instrumentos' })).getByRole(
      'listitem',
    );
    expect(item).toHaveTextContent('Emenda parlamentar · Secretaria de Cultura');
    expect(item).toHaveTextContent('R$ 150.000,50');
    expect(item).toHaveTextContent('vigência de 01/04/2026 a 31/03/2027');
  });

  it('perfil que so consulta nao ve as acoes de cadastro e edicao', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /instruments': () => ({ status: 200, body: [EMENDA] }),
    });
    renderView();

    await screen.findByRole('list', { name: 'Instrumentos' });
    expect(screen.queryByRole('button', { name: 'Novo instrumento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole('button', { name: 'Novo instrumento' }));
    fill('Tipo', 'EMENDA');
    fill('Órgão concedente', 'Secretaria de Cultura');
    fill('Número do processo', '00150-1/2026');
    fill('Valor global (R$)', '150.000,50');
    fill('Data de celebração', '2026-03-10');
    fill('Início da vigência', '2026-04-01');
    fill('Fim da vigência', '2027-03-31');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar instrumento' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'outro instrumento já usa o processo 00150-1/2026',
      ),
    );
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

  it('vigencia invertida e valor invalido nao chamam a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /instruments': () => ({ status: 200, body: [] }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Novo instrumento' }));
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
      await screen.findByRole('button', { name: 'Editar instrumento do processo 00150-1/2026' }),
    );
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
