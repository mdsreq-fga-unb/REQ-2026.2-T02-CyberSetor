import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { PublicForm } from '@/types/inscricao-publica';
import { PublicRegistrationView } from './public-registration-view';

const CODIGO = 'codigoPublicoA01';

const FORM: PublicForm = {
  atividade: { titulo: 'Oficina de serigrafia', data: '2026-11-10', local: 'Setor Comercial Sul' },
  aberta: true,
  camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  camposAdicionais: ['CPF'],
  aviso: { versao: '2026-10-28-provisoria', texto: 'O Instituto usa os dados para a inscrição.' },
};

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function stubApi(routes: Record<string, Route>) {
  const calls: { key: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      calls.push({ key, body });
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route(body);
      return json(result.status, result.body);
    }),
  );
  return calls;
}

const GET = `GET /public/registrations/${CODIGO}`;
const POST = `POST /public/registrations/${CODIGO}`;

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PublicRegistrationView codigo={CODIGO} />
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function bornYearsAgo(anos: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - anos);
  date.setDate(date.getDate() - 2);
  return date.toISOString().slice(0, 10);
}

function fillAdult() {
  fill('Nome completo', 'Ana Souza');
  fill('Telefone com DDD', '(61) 99999-8888');
  fill('Data de nascimento', '1990-05-20');
  fill('CPF', '529.982.247-25');
}

describe('formulario publico de inscricao', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('mostra a atividade, so os campos pedidos, o aviso e as autorizacoes desmarcadas', async () => {
    stubApi({ [GET]: () => ({ status: 200, body: FORM }) });
    renderView();

    expect(
      await screen.findByRole('heading', { name: 'Inscrição: Oficina de serigrafia' }),
    ).toBeInTheDocument();
    expect(screen.getByText('10/11/2026 · Setor Comercial Sul')).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.getByText('O Instituto usa os dados para a inscrição.')).toBeInTheDocument();
    expect(screen.getByLabelText('Quero receber comunicados do Instituto')).not.toBeChecked();
    expect(
      screen.getByLabelText('Autorizo o uso da minha imagem em materiais do Instituto'),
    ).not.toBeChecked();
    expect(screen.queryByLabelText('Nome do responsável')).not.toBeInTheDocument();
  });

  it('envia so os campos pedidos, sem pontuacao, com a versao do aviso, e confirma', async () => {
    const calls = stubApi({
      [GET]: () => ({ status: 200, body: FORM }),
      [POST]: () => ({
        status: 201,
        body: {
          situacao: 'CONFIRMADA',
          atividade: FORM.atividade,
          inscritoEm: '2026-10-28T13:00:00.000Z',
        },
      }),
    });
    renderView();

    await screen.findByLabelText('CPF');
    fillAdult();
    fireEvent.click(screen.getByLabelText('Quero receber comunicados do Instituto'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    expect(
      await screen.findByRole('heading', { name: 'Inscrição confirmada' }),
    ).toBeInTheDocument();
    expect(calls.find((call) => call.key === POST)?.body).toEqual({
      nome: 'Ana Souza',
      telefone: '61999998888',
      dataNascimento: '1990-05-20',
      cpf: '52998224725',
      versaoAviso: '2026-10-28-provisoria',
      autorizaComunicados: true,
      autorizaImagem: false,
    });
  });

  it('nome de preferencia e opcional e vai sem espacos quando preenchido', async () => {
    const calls = stubApi({
      [GET]: () => ({ status: 200, body: FORM }),
      [POST]: () => ({
        status: 201,
        body: {
          situacao: 'CONFIRMADA',
          atividade: FORM.atividade,
          inscritoEm: '2026-10-30T13:00:00.000Z',
        },
      }),
    });
    renderView();

    await screen.findByLabelText('CPF');
    fillAdult();
    fill('Como prefere ser chamado(a)? (opcional)', '  Aninha  ');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    await screen.findByRole('heading', { name: 'Inscrição confirmada' });
    expect(calls.find((call) => call.key === POST)?.body).toMatchObject({
      nome: 'Ana Souza',
      nomePreferencia: 'Aninha',
    });
  });

  it('menor de 18 anos ve e precisa preencher o responsavel legal antes de enviar', async () => {
    const calls = stubApi({ [GET]: () => ({ status: 200, body: FORM }) });
    renderView();

    await screen.findByLabelText('CPF');
    fillAdult();
    fill('Data de nascimento', bornYearsAgo(15));
    expect(await screen.findByLabelText('Nome do responsável')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'O responsável legal autoriza o uso da imagem do participante em materiais do Instituto',
      ),
    ).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    expect(await screen.findByText('Informe o nome do responsável legal.')).toBeInTheDocument();
    expect(screen.getByText('Informe o telefone do responsável com DDD.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === POST)).toBe(false);
  });

  it('CPF invalido e campos vazios sao recusados sem chamar a API', async () => {
    const calls = stubApi({ [GET]: () => ({ status: 200, body: FORM }) });
    renderView();

    await screen.findByLabelText('CPF');
    fill('CPF', '529.982.247-24');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    expect(await screen.findByText('CPF inválido. Confira os números.')).toBeInTheDocument();
    expect(screen.getByText('Informe o seu nome.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === POST)).toBe(false);
  });

  it('envio repetido mostra a recusa da API', async () => {
    stubApi({
      [GET]: () => ({ status: 200, body: FORM }),
      [POST]: () => ({
        status: 409,
        body: {
          code: 'ALREADY_REGISTERED',
          message: 'Já existe uma inscrição com estes dados nesta atividade.',
        },
      }),
    });
    renderView();

    await screen.findByLabelText('CPF');
    fillAdult();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma inscrição com estes dados nesta atividade.',
    );
  });

  it('inscricao encerrada durante o preenchimento troca para o aviso de encerramento', async () => {
    stubApi({
      [GET]: () => ({ status: 200, body: FORM }),
      [POST]: () => ({
        status: 409,
        body: {
          code: 'REGISTRATION_CLOSED',
          message: 'As inscrições desta atividade estão encerradas.',
        },
      }),
    });
    renderView();

    await screen.findByLabelText('CPF');
    fillAdult();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar inscrição' }));

    expect(
      await screen.findByRole('heading', { name: 'Inscrições encerradas' }),
    ).toBeInTheDocument();
  });

  it('inscricao fechada mostra o aviso sem o formulario', async () => {
    stubApi({ [GET]: () => ({ status: 200, body: { ...FORM, aberta: false } }) });
    renderView();

    expect(
      await screen.findByRole('heading', { name: 'Inscrições encerradas' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
  });

  it('link inexistente mostra o aviso de link invalido', async () => {
    stubApi({
      [GET]: () => ({
        status: 404,
        body: { code: 'REGISTRATION_LINK_NOT_FOUND', message: 'Link de inscrição inválido.' },
      }),
    });
    renderView();

    expect(
      await screen.findByRole('heading', { name: 'Link de inscrição inválido' }),
    ).toBeInTheDocument();
  });
});
