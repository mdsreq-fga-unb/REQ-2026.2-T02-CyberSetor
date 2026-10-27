import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  versao: 1,
  deveTrocarSenha: false,
  bloqueadoAte: null,
  ultimoAcessoEm: null,
  setor: null,
};

const EDUCADORA: Account = {
  ...ADMIN,
  id: '00000000-0000-4000-8000-000000000002',
  pessoaId: '00000000-0000-4000-8000-000000000012',
  nome: 'Bia Educadora',
  emailLogin: 'bia@instituto.org.br',
  perfil: 'NUCLEO_PEDAGOGICO',
  deveTrocarSenha: true,
  setor: { id: '00000000-0000-4000-8000-000000000401', nome: 'Coordenação Pedagógica' },
};

const SECTORS = [
  {
    id: '00000000-0000-4000-8000-000000000401',
    versao: 1,
    nome: 'Coordenação Pedagógica',
    ativo: true,
  },
  { id: '00000000-0000-4000-8000-000000000402', versao: 1, nome: 'Comunicação', ativo: true },
  { id: '00000000-0000-4000-8000-000000000403', versao: 2, nome: 'Antigo', ativo: false },
];

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

  it('lista as contas numa tabela com perfil, setor e situacao', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN, EDUCADORA] }),
    });
    renderView();

    await screen.findAllByText('Bia Educadora');
    const table = screen.getByRole('table', {
      name: 'Contas da equipe do Instituto, com o perfil de acesso e o setor de cada pessoa.',
    });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    const [pessoa, perfil, situacao] = within(rows[2]).getAllByRole('cell');
    expect(pessoa).toHaveTextContent('Bia Educadora');
    expect(perfil).toHaveTextContent('Núcleo Pedagógico e Educadores');
    expect(perfil).toHaveTextContent('Coordenação Pedagógica');
    expect(situacao).toHaveTextContent('Troca de senha pendente');
  });

  it('pagina as contas de dez em dez', async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      ...EDUCADORA,
      id: `00000000-0000-4000-8000-0000000001${String(index).padStart(2, '0')}`,
      nome: `Pessoa ${String(index + 1).padStart(2, '0')}`,
    }));
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: many }),
    });
    renderView();

    const nav = await screen.findByRole('navigation', { name: 'Paginação das contas' });
    expect(within(nav).getByRole('status')).toHaveTextContent('1–10 de 12');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);

    fireEvent.click(within(nav).getByRole('button', { name: 'Próxima página' }));

    expect(within(nav).getByRole('status')).toHaveTextContent('11–12 de 12');
    expect(screen.getByText('Pessoa 12')).toBeInTheDocument();
    expect(screen.queryByText('Pessoa 01')).not.toBeInTheDocument();
  });

  it('enquanto carrega, a tabela fica ocupada com o cabecalho visivel', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
    });
    renderView();

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(within(table).getByRole('columnheader', { name: 'Pessoa' })).toBeInTheDocument();
    await waitFor(() => expect(table).toHaveAttribute('aria-busy', 'false'));
  });

  it('cria a conta e mostra a senha temporaria uma vez', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      'GET /sectors': () => ({ status: 200, body: SECTORS }),
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
    await screen.findByRole('option', { name: 'Comunicação' });
    expect(screen.queryByRole('option', { name: 'Antigo' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Setor (opcional)'), {
      target: { value: SECTORS[0].id },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByLabelText('Senha temporária')).toHaveValue('Temporaria-123456');
    expect(calls.find((call) => call.key === 'POST /accounts')?.body).toEqual({
      nome: 'Bia Educadora',
      emailLogin: 'bia@instituto.org.br',
      perfil: 'NUCLEO_PEDAGOGICO',
      setorId: SECTORS[0].id,
    });
  });

  it('muda o setor da pessoa e tira o setor', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN, EDUCADORA] }),
      'GET /sectors': () => ({ status: 200, body: SECTORS }),
      [`PATCH /accounts/${EDUCADORA.id}/sector`]: (body) => ({
        status: 200,
        body: {
          ...EDUCADORA,
          setor:
            (body as { setorId: string | null }).setorId === null
              ? null
              : { id: SECTORS[1].id, nome: 'Comunicação' },
        },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Mudar setor' }));
    await screen.findByRole('option', { name: 'Comunicação' });
    expect(screen.getByLabelText('Setor')).toHaveValue(SECTORS[0].id);
    fireEvent.change(screen.getByLabelText('Setor'), { target: { value: SECTORS[1].id } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));
    expect(await screen.findByText('Setor de Bia Educadora: Comunicação')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Mudar setor' }));
    await screen.findByRole('option', { name: 'Comunicação' });
    fireEvent.change(screen.getByLabelText('Setor'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));
    expect(await screen.findByText('Bia Educadora sem setor')).toBeInTheDocument();

    expect(calls.filter((call) => call.key.endsWith('/sector')).map((call) => call.body)).toEqual([
      { setorId: SECTORS[1].id, versao: 1 },
      { setorId: null, versao: 1 },
    ]);
  });

  it('mudanca de perfil sobre versao antiga recarrega a conta e avisa', async () => {
    let listed = 0;
    const atual: Account = { ...EDUCADORA, perfil: 'PRESIDENCIA_GESTAO', versao: 2 };
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => {
        listed += 1;
        return { status: 200, body: [ADMIN, listed === 1 ? EDUCADORA : atual] };
      },
      [`PATCH /accounts/${EDUCADORA.id}/profile`]: (body) =>
        (body as { versao: number }).versao === 1
          ? {
              status: 409,
              body: { code: 'VERSION_CONFLICT', message: 'A conta foi alterada por outra pessoa.' },
            }
          : { status: 200, body: { ...atual, perfil: 'CONCEDENTE_AUDITORIA', versao: 3 } },
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Mudar perfil' }));
    fireEvent.change(await screen.findByLabelText('Perfil'), {
      target: { value: 'CONCEDENTE_AUDITORIA' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Outra pessoa alterou esta conta. O formulário mostra a versão atual',
    );
    expect(screen.getByLabelText('Perfil')).toHaveValue('PRESIDENCIA_GESTAO');

    fireEvent.change(screen.getByLabelText('Perfil'), {
      target: { value: 'CONCEDENTE_AUDITORIA' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() =>
      expect(
        calls.filter((call) => call.key.endsWith('/profile')).map((call) => call.body),
      ).toEqual([
        { perfil: 'CONCEDENTE_AUDITORIA', versao: 1 },
        { perfil: 'CONCEDENTE_AUDITORIA', versao: 2 },
      ]),
    );
  });

  it('setor recusado pela API mostra o motivo', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [EDUCADORA] }),
      'GET /sectors': () => ({ status: 200, body: SECTORS }),
      [`PATCH /accounts/${EDUCADORA.id}/sector`]: () => ({
        status: 400,
        body: { code: 'INVALID_SECTOR', message: 'Setor inexistente ou inativo.' },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bia Educadora' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Mudar setor' }));
    await screen.findByRole('option', { name: 'Comunicação' });
    fireEvent.change(screen.getByLabelText('Setor'), { target: { value: SECTORS[1].id } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar setor' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Setor inexistente ou inativo.');
  });

  it('sem a lista de setores, avisa e nao cria a conta', async () => {
    await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      'GET /sectors': () => ({ status: 500 }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Nova conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os setores.',
    );
    expect(screen.getByLabelText('Setor (opcional)')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled();
  });

  it('administracao do sistema e concedente nao tem setor', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      'GET /sectors': () => ({ status: 200, body: SECTORS }),
      'POST /accounts': () => ({
        status: 201,
        body: {
          conta: { ...ADMIN, perfil: 'CONCEDENTE_AUDITORIA' },
          senhaTemporaria: 'Temporaria-123456',
        },
      }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Administradora' }));
    expect(await screen.findByRole('menuitem', { name: 'Mudar perfil' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Mudar setor' })).not.toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

    fireEvent.click(await screen.findByRole('button', { name: 'Nova conta' }));
    fireEvent.change(await screen.findByLabelText('Nome'), {
      target: { value: 'Caio Concedente' },
    });
    fireEvent.change(screen.getByLabelText('E-mail de acesso'), {
      target: { value: 'caio@concedente.gov.br' },
    });
    fireEvent.change(screen.getByLabelText('Perfil'), { target: { value: 'NUCLEO_PEDAGOGICO' } });
    await screen.findByRole('option', { name: 'Comunicação' });
    fireEvent.change(screen.getByLabelText('Setor (opcional)'), {
      target: { value: SECTORS[0].id },
    });
    fireEvent.change(screen.getByLabelText('Perfil'), {
      target: { value: 'CONCEDENTE_AUDITORIA' },
    });
    expect(screen.queryByLabelText('Setor (opcional)')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByLabelText('Senha temporária')).toBeInTheDocument();
    expect(calls.find((call) => call.key === 'POST /accounts')?.body).toEqual({
      nome: 'Caio Concedente',
      emailLogin: 'caio@concedente.gov.br',
      perfil: 'CONCEDENTE_AUDITORIA',
    });
  });

  it('formulario incompleto nao chama a API', async () => {
    const calls = await signedInAs('ADMINISTRACAO_SISTEMA', {
      'GET /accounts': () => ({ status: 200, body: [ADMIN] }),
      'GET /sectors': () => ({ status: 200, body: SECTORS }),
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

    expect(await screen.findByLabelText('Senha temporária')).toHaveValue('Nova-temporaria-987');
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
