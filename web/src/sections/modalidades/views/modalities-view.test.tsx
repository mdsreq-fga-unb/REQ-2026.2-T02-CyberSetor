import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Modality } from '@/types/modalidades';
import { ModalitiesView } from './modalities-view';

const OFICINA: Modality = {
  id: '00000000-0000-4000-8000-000000000201',
  versao: 2,
  nome: 'Oficina contínua',
  descricao: 'Turma com encontros regulares',
  ativo: true,
};
const EVENTO: Modality = {
  id: '00000000-0000-4000-8000-000000000202',
  versao: 1,
  nome: 'Evento aberto',
  descricao: null,
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
  await signIn('pedagogico@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <ModalitiesView />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function openActions(nome: string) {
  fireEvent.click(await screen.findByRole('button', { name: `Ações da modalidade ${nome}` }));
}

describe('modalidades', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista numa tabela com nome, descricao e situacao, sem acoes para quem so consulta', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      'GET /modalities': () => ({ status: 200, body: [EVENTO, OFICINA] }),
    });
    renderView();

    await screen.findAllByText('Oficina contínua');
    const table = screen.getByRole('table', {
      name: 'Tipos de atividade que o Instituto realiza, usados no cadastro das atividades.',
    });
    const [, evento, oficina] = within(table).getAllByRole('row');
    expect(within(oficina).getAllByRole('cell')[0]).toHaveTextContent(
      'Oficina contínuaTurma com encontros regulares',
    );
    expect(within(oficina).getAllByRole('cell')[1]).toHaveTextContent('Ativa');
    expect(within(evento).getAllByRole('cell')[1]).toHaveTextContent('Inativa');
    expect(screen.queryByRole('button', { name: 'Nova modalidade' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações da modalidade/ })).not.toBeInTheDocument();
  });

  it('o nucleo pedagogico cadastra com o nome aparado e ve o aviso de sucesso', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /modalities': () => ({ status: 200, body: [] }),
      'POST /modalities': () => ({ status: 201, body: OFICINA }),
    });
    renderView();

    await screen.findByText('Nenhuma modalidade cadastrada');
    fireEvent.click(screen.getAllByRole('button', { name: 'Nova modalidade' })[0]);
    fill('Nome', '  Oficina contínua  ');
    fill('Descrição (opcional)', 'Turma com encontros regulares');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modalidade' }));

    expect(await screen.findByText('Modalidade salva')).toBeInTheDocument();
    expect(calls.find((call) => call.key === 'POST /modalities')?.body).toEqual({
      nome: 'Oficina contínua',
      descricao: 'Turma com encontros regulares',
    });
  });

  it('nome vazio nao chama a API', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /modalities': () => ({ status: 200, body: [] }),
    });
    renderView();

    await screen.findByText('Nenhuma modalidade cadastrada');
    fireEvent.click(screen.getAllByRole('button', { name: 'Nova modalidade' })[0]);
    fill('Nome', '   ');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modalidade' }));

    expect(await screen.findByText('Informe o nome da modalidade.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /modalities')).toBe(false);
  });

  it('nome repetido mostra a recusa da API no formulario', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /modalities': () => ({ status: 200, body: [OFICINA] }),
      'POST /modalities': () => ({
        status: 409,
        body: { code: 'CONFLICT', message: 'Já existe modalidade com este nome.' },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Nova modalidade' }));
    fill('Nome', 'OFICINA CONTÍNUA');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modalidade' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe modalidade com este nome.',
    );
  });

  it('desativa depois da confirmacao, com a versao lida', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /modalities': () => ({ status: 200, body: [OFICINA] }),
      [`PATCH /modalities/${OFICINA.id}`]: () => ({
        status: 200,
        body: { ...OFICINA, versao: 3, ativo: false },
      }),
    });
    renderView();

    await openActions('Oficina contínua');
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Desativar modalidade' }));
    expect(await screen.findByText(/deixa de aparecer para novas atividades/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desativar modalidade' }));

    expect(await screen.findByText('Modalidade desativada')).toBeInTheDocument();
    expect(calls.find((call) => call.key.startsWith('PATCH'))?.body).toEqual({
      versao: 2,
      ativo: false,
    });
  });

  it('reativa sem confirmacao', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      'GET /modalities': () => ({ status: 200, body: [EVENTO] }),
      [`PATCH /modalities/${EVENTO.id}`]: () => ({
        status: 200,
        body: { ...EVENTO, versao: 2, ativo: true },
      }),
    });
    renderView();

    await openActions('Evento aberto');
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reativar modalidade' }));

    expect(await screen.findByText('Modalidade reativada')).toBeInTheDocument();
    expect(calls.find((call) => call.key.startsWith('PATCH'))?.body).toEqual({
      versao: 1,
      ativo: true,
    });
  });

  it('perfil sem consulta recebe o aviso na primeira recusa da API', async () => {
    const calls = await signedInAs('CONCEDENTE_AUDITORIA', {
      'GET /modalities': () => ({
        status: 403,
        body: { code: 'FORBIDDEN', message: 'Acesso negado.' },
      }),
    });
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O seu perfil não consulta modalidades.',
    );
    expect(calls.filter((call) => call.key === 'GET /modalities')).toHaveLength(1);
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    let lista = [OFICINA];
    const patches: unknown[] = [];
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'GET /modalities': () => ({ status: 200, body: lista }),
      [`PATCH /modalities/${OFICINA.id}`]: (body) => {
        patches.push(body);
        if (patches.length === 1) {
          lista = [{ ...OFICINA, versao: 3, descricao: 'Turma semanal' }];
          return {
            status: 409,
            body: {
              code: 'VERSION_CONFLICT',
              message: 'A modalidade foi alterada por outra pessoa. Recarregue e tente de novo.',
            },
          };
        }
        return { status: 200, body: lista[0] };
      },
    });
    renderView();

    await openActions('Oficina contínua');
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar modalidade' }));
    fill('Nome', 'Oficina formativa');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modalidade' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Outra pessoa alterou');
    expect(screen.getByLabelText('Descrição (opcional)')).toHaveValue('Turma semanal');

    fill('Nome', 'Oficina formativa');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modalidade' }));

    expect(await screen.findByText('Modalidade salva')).toBeInTheDocument();
    expect(patches[0]).toMatchObject({ versao: 2, nome: 'Oficina formativa' });
    expect(patches[1]).toMatchObject({
      versao: 3,
      nome: 'Oficina formativa',
      descricao: 'Turma semanal',
    });
  });
});
