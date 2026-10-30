import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Participant, ParticipantSummary } from '@/types/participantes';
import { ParticipantsView } from './participants-view';

const ANA_ID = '00000000-0000-4000-8000-000000000701';

const ANA_RESUMO: ParticipantSummary = {
  id: ANA_ID,
  versao: 1,
  nome: 'Ana Souza',
  nomePreferencia: 'Aninha',
  idade: 36,
  telefone: '61999998888',
  email: 'ana@exemplo.test',
  inscricoes: 2,
  ultimaAtividade: { id: 'a2', titulo: 'Oficina de dança', data: '2026-11-20' },
};

const ANA: Participant = {
  id: ANA_ID,
  versao: 1,
  nome: 'Ana Souza',
  nomePreferencia: 'Aninha',
  telefone: '61999998888',
  dataNascimento: '1990-05-20',
  idade: 36,
  email: 'ana@exemplo.test',
  cpf: '52998224725',
  bairroRegiao: 'Asa Sul',
  escolaridade: null,
  inscricoes: [
    {
      id: 'i1',
      situacao: 'CONFIRMADA',
      inscritoEm: '2026-10-28T13:00:00.000Z',
      autorizaComunicados: true,
      autorizaImagem: false,
      termoAceitoEm: '2026-10-28T13:00:00.000Z',
      comunicadosRevogacao: null,
      imagemRevogacao: null,
      responsavelNome: null,
      responsavelTelefone: null,
      atividade: { id: 'a2', titulo: 'Oficina de dança', data: '2026-11-20' },
      projetoId: 'p1',
      instrumentoId: 'i1',
    },
  ],
};

type Route = (body: unknown, url: string) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  const calls: { key: string; url: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      calls.push({ key, url, body });
      if (key === 'POST /auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route(body, url);
      return json(result.status, result.body);
    }),
  );
  await signIn('nucleo@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <ParticipantsView />
      </Toaster>
    </QueryClientProvider>,
  );
}

const LIST = 'GET /participants';
const GET = `GET /participants/${ANA_ID}`;
const PATCH = `PATCH /participants/${ANA_ID}`;
const REVOKE = `POST /participants/${ANA_ID}/registrations/i1/revocations`;

async function openCorrection() {
  fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Corrigir dados' }));
  return screen.findByRole('heading', { name: 'Corrigir dados' });
}

describe('participantes', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('outro perfil ve o aviso e nao consulta as fichas', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {});
    renderView();

    expect(
      await screen.findByText('Só o Núcleo Pedagógico acessa as fichas de participantes.'),
    ).toBeInTheDocument();
    expect(calls.some((call) => call.key === LIST)).toBe(false);
  });

  it('lista com idade, inscricoes e ultima atividade, e busca pelo termo', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: (_body, url) => ({
        status: 200,
        body: new URL(url).searchParams.get('busca') === 'ninguem' ? [] : [ANA_RESUMO],
      }),
    });
    renderView();

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('36 anos · 2 inscrições')).toBeInTheDocument();
    expect(screen.getAllByText('(61) 99999-8888').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Oficina de dança · 20/11/2026').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Buscar participante por nome, telefone ou e-mail'), {
      target: { value: 'ninguem' },
    });
    expect(await screen.findByText('Ninguém encontrado')).toBeInTheDocument();
    expect(calls.some((call) => call.url.endsWith('/participants?busca=ninguem'))).toBe(true);
  });

  it('ficha com as inscricoes e as autorizacoes', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 200, body: ANA }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver ficha' }));

    const ficha = within(await screen.findByRole('dialog'));
    expect(await ficha.findByText('529.982.247-25')).toBeInTheDocument();
    expect(ficha.getByText('20/05/1990 (36 anos)')).toBeInTheDocument();
    expect(ficha.getByText('Aninha')).toBeInTheDocument();
    expect(ficha.getByText(/Compromissos da turma aceitos em/)).toBeInTheDocument();
    expect(ficha.getByRole('link', { name: 'Oficina de dança' })).toBeInTheDocument();
    expect(ficha.getByText('Comunicados: sim')).toBeInTheDocument();
    expect(ficha.getByText('Imagem e voz: não')).toBeInTheDocument();
  });

  it('registra a revogacao dos comunicados com canal e data, e a ficha mostra a revogacao', async () => {
    const revogada = {
      ...ANA,
      inscricoes: [
        { ...ANA.inscricoes[0], comunicadosRevogacao: { pedidoEm: '2026-10-29', canal: 'EMAIL' } },
      ],
    };
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 200, body: ANA }),
      [REVOKE]: () => ({ status: 200, body: revogada }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver ficha' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar revogação' }));

    expect(await screen.findByRole('heading', { name: 'Registrar revogação' })).toBeInTheDocument();
    // Só a autorização dada e não revogada aparece para escolha.
    const autorizacao = screen.getByLabelText('Autorização');
    expect(
      within(autorizacao)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Comunicados']);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar revogação' }));
    expect(await screen.findByText('Escolha o canal do pedido.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === REVOKE)).toBe(false);

    fireEvent.change(screen.getByLabelText('Canal do pedido'), { target: { value: 'EMAIL' } });
    fireEvent.change(screen.getByLabelText('Data do pedido'), { target: { value: '2026-10-29' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar revogação' }));

    expect(await screen.findByText('Revogação registrada')).toBeInTheDocument();
    expect(calls.find((call) => call.key === REVOKE)?.body).toEqual({
      autorizacao: 'COMUNICADOS',
      canal: 'EMAIL',
      pedidoEm: '2026-10-29',
    });
    expect(
      await screen.findByText('Comunicados: revogada em 29/10/2026 (e-mail)'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Registrar revogação' })).not.toBeInTheDocument(),
    );
  });

  it('corrige so o que mudou, com a justificativa, e avisa', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 200, body: ANA }),
      [PATCH]: () => ({ status: 200, body: { ...ANA, versao: 2, telefone: '61988887777' } }),
    });
    renderView();
    await openCorrection();

    fireEvent.change(screen.getByLabelText('Telefone com DDD'), {
      target: { value: '(61) 98888-7777' },
    });
    fireEvent.change(screen.getByLabelText('Nome de preferência'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Escolaridade'), { target: { value: '  ' } });
    fireEvent.change(screen.getByLabelText('Bairro ou região'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'Ana@Exemplo.test' } });
    fireEvent.change(screen.getByLabelText('Justificativa'), {
      target: { value: 'Pedido da titular por telefone em 28/10.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));

    expect(await screen.findByText('Dados de Ana Souza corrigidos')).toBeInTheDocument();
    expect(calls.find((call) => call.key === PATCH)?.body).toEqual({
      versao: 1,
      justificativa: 'Pedido da titular por telefone em 28/10.',
      telefone: '61988887777',
      nomePreferencia: null,
      bairroRegiao: null,
    });
  });

  it('erro da API aparece no campo correspondente', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 200, body: ANA }),
      [PATCH]: () => ({
        status: 400,
        body: { code: 'GUARDIAN_REQUIRED', message: 'Menor de idade exige responsável.' },
      }),
    });
    renderView();
    await openCorrection();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana Lima' } });
    fireEvent.change(screen.getByLabelText('Justificativa'), {
      target: { value: 'Pedido da titular por telefone.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));

    expect(await screen.findByText('Menor de idade exige responsável.')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de nascimento')).toHaveAttribute('aria-invalid', 'true');
  });

  it('se a ficha nao carrega, Corrigir dados mostra o erro em vez de nada', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 500, body: { code: 'INTERNAL', message: 'falha' } }),
    });
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Corrigir dados' }));

    expect(
      await screen.findByText('Não foi possível carregar a ficha. Feche e tente de novo.'),
    ).toBeInTheDocument();
  });

  it('lista cortada em 200 avisa para refinar a busca', async () => {
    const many = Array.from({ length: 201 }, (_, index) => ({
      ...ANA_RESUMO,
      id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      nome: `Pessoa ${String(index).padStart(3, '0')}`,
    }));
    await signedInAs('NUCLEO_PEDAGOGICO', { [LIST]: () => ({ status: 200, body: many }) });
    renderView();

    expect(await screen.findByText(/Mostrando os 200 primeiros por nome/)).toBeInTheDocument();
  });

  it('sem justificativa ou sem mudanca, nao chama a API', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({ status: 200, body: ANA }),
    });
    renderView();
    await openCorrection();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana Lima' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));
    expect(
      await screen.findByText('Descreva o pedido do titular em pelo menos 10 caracteres.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana Souza' } });
    fireEvent.change(screen.getByLabelText('Justificativa'), {
      target: { value: 'Pedido da titular por telefone.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));
    expect(await screen.findByText('Nenhum dado foi alterado.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === PATCH)).toBe(false);
  });

  it('conflito de versao recarrega a ficha e pede para refazer', async () => {
    let versao = 1;
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [ANA_RESUMO] }),
      [GET]: () => ({
        status: 200,
        body: { ...ANA, versao, nome: versao > 1 ? 'Ana S. Lima' : ANA.nome },
      }),
      [PATCH]: () => {
        versao = 2;
        return {
          status: 409,
          body: { code: 'VERSION_CONFLICT', message: 'Os dados foram alterados por outra pessoa.' },
        };
      },
    });
    renderView();
    await openCorrection();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana Lima' } });
    fireEvent.change(screen.getByLabelText('Justificativa'), {
      target: { value: 'Pedido da titular por telefone.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Outra pessoa alterou estes dados.');
    expect(await screen.findByDisplayValue('Ana S. Lima')).toBeInTheDocument();
    expect(screen.getByLabelText('Justificativa')).toHaveValue('Pedido da titular por telefone.');
  });
});
