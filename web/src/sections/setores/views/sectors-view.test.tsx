import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Sector } from '@/types/setores';
import { SectorsView } from './sectors-view';

const PEDAGOGICA: Sector = {
  id: '00000000-0000-4000-8000-000000000401',
  versao: 2,
  nome: 'Coordenação Pedagógica',
  ativo: true,
};
const ANTIGO: Sector = {
  id: '00000000-0000-4000-8000-000000000402',
  versao: 1,
  nome: 'Antigo setor',
  ativo: false,
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
        <SectorsView />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(value: string) {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value } });
}

describe('setores', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista com a situacao, sem acoes para quem so consulta', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /sectors': () => ({ status: 200, body: [ANTIGO, PEDAGOGICA] }),
    });
    renderView();

    await screen.findAllByText('Coordenação Pedagógica');
    const table = screen.getByRole('table', {
      name: 'Coordenações e diretorias do Instituto: a lotação de cada pessoa e o setor executor de cada meta.',
    });
    const [, antigo, pedagogica] = within(table).getAllByRole('row');
    expect(within(pedagogica).getAllByRole('cell')[1]).toHaveTextContent('Ativo');
    expect(within(antigo).getAllByRole('cell')[1]).toHaveTextContent('Inativo');
    expect(screen.queryByRole('button', { name: 'Novo setor' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações do setor/ })).not.toBeInTheDocument();
  });

  it('a gestao cadastra com o nome aparado', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /sectors': () => ({ status: 200, body: [] }),
      'POST /sectors': () => ({ status: 201, body: PEDAGOGICA }),
    });
    renderView();

    await screen.findByText('Nenhum setor cadastrado');
    fireEvent.click(screen.getAllByRole('button', { name: 'Novo setor' })[0]);
    fill('  Coordenação Pedagógica  ');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));

    expect(await screen.findByText('Setor salvo')).toBeInTheDocument();
    expect(calls.find((call) => call.key === 'POST /sectors')?.body).toEqual({
      nome: 'Coordenação Pedagógica',
    });
  });

  it('nome vazio nao chama a API, e nome repetido volta ao campo', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /sectors': () => ({ status: 200, body: [PEDAGOGICA] }),
      'POST /sectors': () => ({
        status: 409,
        body: { code: 'SECTOR_NAME_TAKEN', message: 'Já existe setor com este nome.' },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Novo setor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));
    expect(await screen.findByText('Informe o nome do setor.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /sectors')).toBe(false);

    fill('coordenação pedagógica');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));
    expect(await screen.findByText('Já existe setor com este nome.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
  });

  it('desativa depois da confirmacao, com a versao lida', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /sectors': () => ({ status: 200, body: [PEDAGOGICA] }),
      [`PATCH /sectors/${PEDAGOGICA.id}`]: () => ({
        status: 200,
        body: { ...PEDAGOGICA, versao: 3, ativo: false },
      }),
    });
    renderView();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Ações do setor Coordenação Pedagógica' }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Desativar setor' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desativar setor' }));

    expect(await screen.findByText('Setor desativado')).toBeInTheDocument();
    expect(calls.find((call) => call.key.startsWith('PATCH'))?.body).toEqual({
      versao: 2,
      ativo: false,
    });
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    const patches: unknown[] = [];
    const fresh = { ...PEDAGOGICA, versao: 4, nome: 'Coordenação Pedagógica e Cultural' };
    let lists = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /sectors': () => ({ status: 200, body: lists++ === 0 ? [PEDAGOGICA] : [fresh] }),
      [`PATCH /sectors/${PEDAGOGICA.id}`]: (body) => {
        patches.push(body);
        return patches.length === 1
          ? { status: 409, body: { code: 'VERSION_CONFLICT', message: 'O setor foi alterado.' } }
          : { status: 200, body: { ...fresh, versao: 5 } };
      },
    });
    renderView();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Ações do setor Coordenação Pedagógica' }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar setor' }));
    fill('Pedagógica');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));

    expect(await screen.findByText(/Outra pessoa alterou este setor/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Coordenação Pedagógica e Cultural');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));

    expect(await screen.findByText('Setor salvo')).toBeInTheDocument();
    expect(patches[1]).toEqual({ versao: 4, nome: 'Coordenação Pedagógica e Cultural' });
  });
});
