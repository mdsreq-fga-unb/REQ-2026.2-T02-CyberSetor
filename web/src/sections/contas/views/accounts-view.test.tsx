import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Account } from '@/types/contas';
import { AccountsView } from './accounts-view';

const ADMIN: Account = {
  id: '00000000-0000-4000-8000-000000000001',
  pessoaId: '00000000-0000-4000-8000-000000000011',
  nome: 'Ana Administradora',
  emailLogin: 'ana@instituto.org.br',
  perfil: 'ADMINISTRACAO_SISTEMA',
  ativo: true,
  deveTrocarSenha: false,
  bloqueadoAte: null,
  ultimoAcessoEm: null,
};

const EDUCADORA: Account = {
  ...ADMIN,
  id: '00000000-0000-4000-8000-000000000002',
  pessoaId: '00000000-0000-4000-8000-000000000012',
  nome: 'Bia Educadora',
  emailLogin: 'bia@instituto.org.br',
  perfil: 'NUCLEO_PEDAGOGICO',
  deveTrocarSenha: true,
};

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route> = {}) {
  const calls: { key: string; body: unknown }[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
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
  });
  vi.stubGlobal('fetch', fetchMock);
  await signIn('ana@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <AccountsView />
      </Toaster>
    </QueryClientProvider>,
  );
}

describe('administracao de contas', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('perfil sem administracao nao consulta contas', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO');
    renderView();

    expect(screen.getByText('Só a administração do sistema gerencia contas.')).toBeInTheDocument();
    expect(calls.map((call) => call.key)).toEqual(['POST /auth/login']);
  });

  it('lista as contas numa tabela com perfil e situacao', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN, EDUCADORA] }),
    });
    renderView();

    const table = await screen.findByRole('table', {
      name: 'Contas da equipe do Instituto e o perfil de acesso de cada pessoa.',
    });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    const [pessoa, perfil, situacao] = within(rows[2]).getAllByRole('cell');
    expect(pessoa).toHaveTextContent('Bia Educadora');
    expect(perfil).toHaveTextContent('Núcleo Pedagógico e Educadores');
    expect(situacao).toHaveTextContent('Troca de senha pendente');
  });

  it('cria a conta e mostra a senha temporaria uma vez', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      'POST /accounts': () => ({
        status: 201,
        body: { conta: EDUCADORA, senhaTemporaria: 'Temporaria-123456' },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Nova conta' }));
    fireEvent.change(await screen.findByLabelText('Nome'), { target: { value: 'Bia Educadora' } });
    fireEvent.change(screen.getByLabelText('E-mail de acesso'), {
      target: { value: 'bia@instituto.org.br' },
    });
    fireEvent.change(screen.getByLabelText('Perfil'), { target: { value: 'NUCLEO_PEDAGOGICO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByLabelText('Senha temporária')).toHaveTextContent('Temporaria-123456');
    expect(calls.find((call) => call.key === 'POST /accounts')?.body).toEqual({
      nome: 'Bia Educadora',
      emailLogin: 'bia@instituto.org.br',
      perfil: 'NUCLEO_PEDAGOGICO',
    });
  });

  it('formulario incompleto nao chama a API', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Nova conta' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument();
    expect(screen.getByText('Escolha o perfil.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === 'POST /accounts')).toBe(false);
  });

  it('mostra a recusa de desativar o ultimo administrador', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      [`POST /accounts/${ADMIN.id}/deactivate`]: () => ({
        status: 409,
        body: {
          code: 'LAST_ADMIN',
          message: 'A operação deixaria o sistema sem administrador ativo.',
        },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Administradora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Desativar conta' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desativar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A operação deixaria o sistema sem administrador ativo.',
    );
  });

  it('redefine a senha depois de confirmar e mostra a nova senha temporaria', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN, EDUCADORA] }),
      [`POST /accounts/${EDUCADORA.id}/password-reset`]: () => ({
        status: 200,
        body: { conta: EDUCADORA, senhaTemporaria: 'Nova-temporaria-987' },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Redefinir senha' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Redefinir senha' }));

    expect(await screen.findByLabelText('Senha temporária')).toHaveTextContent(
      'Nova-temporaria-987',
    );
  });

  it('avisa quando a conta desativada coordena projetos', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN, EDUCADORA] }),
      [`POST /accounts/${EDUCADORA.id}/deactivate`]: () => ({
        status: 200,
        body: { conta: { ...EDUCADORA, ativo: false }, projetosCoordenados: 2 },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Desativar conta' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desativar conta' }));

    expect(
      await screen.findByText('Ela coordena 2 projetos: reatribua a coordenação.'),
    ).toBeInTheDocument();
  });
});
