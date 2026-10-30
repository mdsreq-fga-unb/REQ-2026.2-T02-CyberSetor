import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import type { Registration } from '@/types/inscricoes';
import { RegistrationFormDialog } from './registration-form-dialog';

const ACTIVITY: Activity = {
  id: '00000000-0000-4000-8000-000000000060',
  versao: 1,
  projetoId: '00000000-0000-4000-8000-000000000010',
  titulo: 'Oficina de Teatro — Turma A',
  modalidade: {
    id: '00000000-0000-4000-8000-000000000031',
    nome: 'Oficina Formativa',
    ativo: true,
  },
  responsavel: {
    id: '00000000-0000-4000-8000-000000000041',
    nome: 'Carlos Instrutor',
    ativo: true,
  },
  data: '2026-05-10',
  local: 'Galpão SCS',
  inscricao: null,
  metas: [{ id: '00000000-0000-4000-8000-000000000051', ordem: 1, objetivo: 'Atender 100 jovens' }],
};

const REGISTRATION_MOCK: Registration = {
  atividadeId: ACTIVITY.id,
  versao: 1,
  aberta: true,
  vagas: 30,
  camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  camposAdicionais: ['CPF', 'EMAIL'],
  campoDuplicidade: 'CPF',
  termoCompromisso: null,
  codigoPublico: 'abc123xyz789',
  linkPublico: '/inscrever/abc123xyz789',
};

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

function renderDialog({
  activity = ACTIVITY,
  instrumentAtivo = true,
  onClose = vi.fn(),
  onSaved = vi.fn(),
  onOpenShare = vi.fn(),
}: {
  activity?: Activity | null;
  instrumentAtivo?: boolean;
  onClose?: () => void;
  onSaved?: (r: Registration) => void;
  onOpenShare?: (r: Registration) => void;
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RegistrationFormDialog
        open={true}
        activity={activity}
        instrumentAtivo={instrumentAtivo}
        onClose={onClose}
        onSaved={onSaved}
        onOpenShare={onOpenShare}
      />
    </QueryClientProvider>,
  );
}

describe('RegistrationFormDialog', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('abre nova inscricao com POST quando ainda nao aberta, pedindo so o e-mail', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 404,
        body: { code: 'REGISTRATION_NOT_OPENED', message: 'Inscrição não aberta' },
      }),
      [`POST /activities/${ACTIVITY.id}/registration`]: (body) => ({
        status: 201,
        body: { ...REGISTRATION_MOCK, ...(body as object) },
      }),
    });

    const onSaved = vi.fn();
    renderDialog({ onSaved });

    expect(
      await screen.findByRole('heading', { name: 'Configurar formulário de inscrição' }),
    ).toBeInTheDocument();
    const submit = await screen.findByRole('button', { name: 'Abrir inscrição' });
    expect(await screen.findByText(/Proteção de dados/)).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    fireEvent.click(submit);

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));

    const postCall = calls.find((c) => c.key === `POST /activities/${ACTIVITY.id}/registration`);
    expect(postCall).toBeDefined();
    expect(postCall?.body).toMatchObject({
      vagas: 30,
      camposAdicionais: ['EMAIL'],
      campoDuplicidade: 'EMAIL',
    });
  });

  it('na falha ao carregar a inscricao, nao mostra o formulario de abertura', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 500,
        body: { code: 'INTERNAL_ERROR' },
      }),
    });

    renderDialog();

    expect(
      await screen.findByText(
        'Não foi possível carregar a inscrição. Tente de novo.',
        {},
        { timeout: 6000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir inscrição' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(calls.some((c) => c.key === `POST /activities/${ACTIVITY.id}/registration`)).toBe(false);
  }, 10_000);

  it('abre com os compromissos da turma e tira o texto na edicao', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 404,
        body: { code: 'REGISTRATION_NOT_OPENED', message: 'Inscrição não aberta' },
      }),
      [`POST /activities/${ACTIVITY.id}/registration`]: (body) => ({
        status: 201,
        body: { ...REGISTRATION_MOCK, ...(body as object) },
      }),
    });
    const onSaved = vi.fn();
    renderDialog({ onSaved });

    fireEvent.change(await screen.findByLabelText('Compromissos da turma (opcional)'), {
      target: { value: '  Chegar no horário.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir inscrição' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(
      calls.find((c) => c.key === `POST /activities/${ACTIVITY.id}/registration`)?.body,
    ).toMatchObject({ termoCompromisso: 'Chegar no horário.' });
  });

  it('na edicao, apagar os compromissos envia null', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: { ...REGISTRATION_MOCK, termoCompromisso: 'Chegar no horário.' },
      }),
      [`PATCH /activities/${ACTIVITY.id}/registration`]: (body) => ({
        status: 200,
        body: { ...REGISTRATION_MOCK, ...(body as object), versao: 2 },
      }),
    });
    const onSaved = vi.fn();
    renderDialog({ onSaved });

    const termo = await screen.findByLabelText('Compromissos da turma (opcional)');
    expect(termo).toHaveValue('Chegar no horário.');
    fireEvent.change(termo, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(
      calls.find((c) => c.key === `PATCH /activities/${ACTIVITY.id}/registration`)?.body,
    ).toMatchObject({ termoCompromisso: null });
  });

  it('edita inscricao existente com PATCH e versao', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: REGISTRATION_MOCK,
      }),
      [`PATCH /activities/${ACTIVITY.id}/registration`]: (body) => ({
        status: 200,
        body: { ...REGISTRATION_MOCK, ...(body as object), versao: 2 },
      }),
    });

    const onSaved = vi.fn();
    renderDialog({ onSaved });

    expect(
      await screen.findByRole('heading', { name: 'Editar formulário de inscrição' }),
    ).toBeInTheDocument();
    const submit = await screen.findByRole('button', { name: 'Salvar alterações' });
    expect(screen.getByRole('switch', { name: /Situação da inscrição/ })).toBeChecked();

    const vagasInput = screen.getByLabelText(/Número de vagas/);
    fireEvent.change(vagasInput, { target: { value: '45' } });
    fireEvent.click(submit);

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));

    const patchCall = calls.find((c) => c.key === `PATCH /activities/${ACTIVITY.id}/registration`);
    expect(patchCall).toBeDefined();
    expect(patchCall?.body).toMatchObject({
      versao: 1,
      vagas: 45,
    });
  });

  it('recusa vagas menor que 1 ou vazio sem chamar a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 404,
        body: { code: 'REGISTRATION_NOT_OPENED' },
      }),
    });

    renderDialog();
    expect(
      await screen.findByRole('heading', { name: 'Configurar formulário de inscrição' }),
    ).toBeInTheDocument();
    const submit = await screen.findByRole('button', { name: 'Abrir inscrição' });

    const vagasInput = screen.getByLabelText(/Número de vagas/);
    fireEvent.change(vagasInput, { target: { value: '0' } });
    fireEvent.click(submit);

    expect(await screen.findByText('Informe ao menos 1 vaga.')).toBeInTheDocument();
    expect(calls.filter((c) => c.key.startsWith('POST /activities'))).toHaveLength(0);
  });

  it('ao escolher CPF como identificador de duplicidade, marca automaticamente o campo adicional', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: {
          ...REGISTRATION_MOCK,
          camposAdicionais: ['EMAIL', 'BAIRRO_REGIAO'],
          campoDuplicidade: 'EMAIL',
        },
      }),
    });

    renderDialog();
    expect(
      await screen.findByRole('heading', { name: 'Editar formulário de inscrição' }),
    ).toBeInTheDocument();

    const cpfCheckbox = (await screen.findByRole('checkbox', { name: /CPF/ })) as HTMLInputElement;
    expect(cpfCheckbox.checked).toBe(false);

    // Clica no radio CPF
    const cpfRadio = screen.getByRole('radio', { name: /CPF/ });
    fireEvent.click(cpfRadio);

    // Deve ter marcado automaticamente o checkbox CPF
    expect(cpfCheckbox.checked).toBe(true);
  });

  it('recarrega versao fresca e avisa apos conflito de versao 409', async () => {
    const updatedRegistration: Registration = {
      ...REGISTRATION_MOCK,
      versao: 2,
      vagas: 50,
    };

    let patchAttempts = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: patchAttempts === 0 ? REGISTRATION_MOCK : updatedRegistration,
      }),
      [`PATCH /activities/${ACTIVITY.id}/registration`]: () => {
        patchAttempts++;
        return {
          status: 409,
          body: {
            code: 'VERSION_CONFLICT',
            message: 'A inscrição foi alterada por outra pessoa. Recarregue e tente de novo.',
          },
        };
      },
    });

    renderDialog();
    expect(
      await screen.findByRole('heading', { name: 'Editar formulário de inscrição' }),
    ).toBeInTheDocument();
    const submit = await screen.findByRole('button', { name: 'Salvar alterações' });
    fireEvent.click(submit);

    expect(await screen.findByText(/Outra pessoa alterou esta configuração/i)).toBeInTheDocument();

    // Campo de vagas atualizado com a versão 2 (50)
    const vagasInput = screen.getByLabelText(/Número de vagas/) as HTMLInputElement;
    expect(vagasInput.value).toBe('50');
  });

  it('quando o instrumento esta inativo, desabilita a acao e avisa o usuario', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: REGISTRATION_MOCK,
      }),
    });

    renderDialog({ instrumentAtivo: false });
    expect(
      await screen.findByRole('heading', { name: 'Editar formulário de inscrição' }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText('O instrumento está inativo e não abre nem altera inscrições.'),
    ).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Salvar alterações' });
    expect(submit).toBeDisabled();
  });

  it('exibe erro de validacao se o campo configurado como identificador de duplicidade for desmarcado', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: REGISTRATION_MOCK, // Duplicidade por CPF, campos CPF e EMAIL
      }),
    });

    renderDialog();
    expect(
      await screen.findByRole('heading', { name: 'Editar formulário de inscrição' }),
    ).toBeInTheDocument();

    // Desmarca o checkbox CPF mantendo o radio CPF selecionado
    const cpfCheckbox = screen.getByRole('checkbox', { name: /CPF/ });
    fireEvent.click(cpfCheckbox);

    expect(
      await screen.findByText(
        'O dado escolhido para evitar inscrição em dobro precisa estar entre os dados pedidos.',
      ),
    ).toBeInTheDocument();
  });
});
