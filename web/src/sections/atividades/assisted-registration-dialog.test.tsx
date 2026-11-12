import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import { AssistedRegistrationDialog } from './assisted-registration-dialog';

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
  data: '2026-11-20',
  horaInicio: null,
  horaFim: null,
  cargaHorariaMinutos: null,
  local: 'Galpão Cultural',
  inscricao: {
    aberta: true,
    vagas: 20,
    inscritos: 5,
    emEspera: 0,
  },
  metas: [{ id: '00000000-0000-4000-8000-000000000051', ordem: 1, objetivo: 'Atender 100 jovens' }],
};

const ACTIVITY_FULL: Activity = {
  ...ACTIVITY,
  inscricao: {
    aberta: true,
    vagas: 5,
    inscritos: 5,
    emEspera: 2,
  },
};

type Route = (body: unknown, searchParams: URLSearchParams) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  const calls: { key: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const parsed = new URL(url);
      const key = `${init.method ?? 'GET'} ${parsed.pathname.replace(/^\/v1/, '')}`;
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      calls.push({ key, body });
      if (key === 'POST /auth/login') {
        return json(200, {
          accessToken: 'test-token',
          perfil,
          deveTrocarSenha: false,
        });
      }
      if (routes[key]) {
        const res = routes[key](body, parsed.searchParams);
        return json(res.status, res.body);
      }
      if (key === 'GET /activities/00000000-0000-4000-8000-000000000060/registration') {
        return json(200, {
          atividadeId: '00000000-0000-4000-8000-000000000060',
          versao: 1,
          aberta: true,
          vagas: 20,
          camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
          camposAdicionais: ['CPF', 'EMAIL'],
          campoDuplicidade: 'CPF',
          codigoPublico: 'abc123xyz789',
          linkPublico: '/inscrever/abc123xyz789',
        });
      }
      if (key === FORM_PATH) return json(200, PUBLIC_FORM);
      return json(404, { message: `Sem mock para ${key}` });
    }),
  );
  await signIn('edu@instituto.test', 's');
  return calls;
}

function renderDialog({
  open = true,
  activity = ACTIVITY,
  onClose = vi.fn(),
  onSuccess = vi.fn(),
}: {
  open?: boolean;
  activity?: Activity | null;
  onClose?: () => void;
  onSuccess?: () => void;
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AssistedRegistrationDialog
        open={open}
        activity={activity}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>,
  );
}

const FORM_PATH = 'GET /public/registrations/abc123xyz789';
const SUBMIT_PATH = 'POST /activities/00000000-0000-4000-8000-000000000060/registration/assisted';

const PUBLIC_FORM = {
  atividade: {
    titulo: 'Oficina de Teatro — Turma A',
    data: '2026-11-20',
    local: 'Galpão Cultural',
  },
  aberta: true,
  vagasEsgotadas: false,
  listaEspera: true,
  camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  camposAdicionais: ['CPF', 'EMAIL'],
  aviso: {
    versao: '2026-10-30-provisoria',
    texto: 'Aviso oficial do Instituto Cultural e Social No Setor.',
  },
  termo: null,
  apresentacao: null,
  prazoInscricao: null,
  prazoHora: null,
  contatoWhatsapp: null,
};

const CREATED = {
  status: 201,
  body: {
    id: 'insc-1',
    situacao: 'CONFIRMADA',
    posicaoEspera: null,
    reaproveitouParticipante: false,
    participante: { id: 'part-1', nome: 'Carlos Adulto' },
    inscritoEm: '2026-11-01T10:00:00.000Z',
  },
};

async function fillAdult() {
  fireEvent.change(await screen.findByLabelText('Nome completo'), {
    target: { value: 'Carlos Adulto' },
  });
  fireEvent.change(screen.getByLabelText('Telefone com DDD'), { target: { value: '61981112233' } });
  fireEvent.change(screen.getByLabelText('Data de nascimento'), {
    target: { value: '1998-04-10' },
  });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'carlos@exemplo.com' } });
}

const submitted = (calls: { key: string; body: unknown }[]) =>
  calls.find((c) => c.key === SUBMIT_PATH)?.body as Record<string, unknown> | undefined;

describe('AssistedRegistrationDialog (HU-08)', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.restoreAllMocks();
  });

  it('mostra os campos pedidos e o aviso de dados, que precisa ser confirmado antes de enviar', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', { [SUBMIT_PATH]: () => CREATED });
    renderDialog();

    expect(await screen.findByText(/Aviso oficial do Instituto/)).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    const aviso = screen.getByRole('checkbox', { name: /Li o aviso para a pessoa/ });
    expect(aviso).not.toBeChecked();

    await fillAdult();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));

    expect(
      await screen.findByText('Confirme que leu o aviso de tratamento de dados para a pessoa.'),
    ).toBeInTheDocument();
    expect(submitted(calls)).toBeUndefined();
  });

  it('envia os dados pedidos com a versao do aviso lido', async () => {
    const onSuccess = vi.fn();
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', { [SUBMIT_PATH]: () => CREATED });
    renderDialog({ onSuccess });

    await fillAdult();
    fireEvent.click(screen.getByRole('checkbox', { name: /Li o aviso para a pessoa/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(submitted(calls)).toEqual({
      nome: 'Carlos Adulto',
      telefone: '61981112233',
      dataNascimento: '1998-04-10',
      cpf: '52998224725',
      email: 'carlos@exemplo.com',
      versaoAviso: '2026-10-30-provisoria',
      autorizaComunicados: false,
      autorizaImagem: false,
    });
  });

  it('com compromissos da turma, exige o aceite e envia a versao do texto', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [FORM_PATH]: () => ({
        status: 200,
        body: { ...PUBLIC_FORM, termo: { versao: 'termo-v1', texto: 'Chegar no horário.' } },
      }),
      [SUBMIT_PATH]: () => CREATED,
    });
    renderDialog();

    await fillAdult();
    fireEvent.click(screen.getByRole('checkbox', { name: /Li o aviso para a pessoa/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));
    expect(
      await screen.findByText('Marque que concorda com os compromissos da turma.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /ouviu os compromissos/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));

    await waitFor(() => expect(submitted(calls)).toMatchObject({ versaoTermo: 'termo-v1' }));
  });

  it('pede o responsavel legal quando a pessoa e menor de 18 anos', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {});
    renderDialog();

    fireEvent.change(await screen.findByLabelText('Data de nascimento'), {
      target: { value: '2012-05-15' },
    });

    expect(
      await screen.findByText('Menor de 18 anos: informe o responsável legal.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do responsável')).toBeInTheDocument();
  });

  it('com as vagas esgotadas, avisa antes da posicao na lista de espera (CA-08.5)', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [FORM_PATH]: () => ({ status: 200, body: { ...PUBLIC_FORM, vagasEsgotadas: true } }),
    });
    renderDialog({ activity: ACTIVITY_FULL });

    expect(await screen.findByText(/esta inscrição entra na lista de espera/)).toBeInTheDocument();
    expect(screen.getByText('3ª posição')).toBeInTheDocument();
  });

  it('reaproveita o cadastro achado e envia so o dado pedido que falta nele (CA-08.3)', async () => {
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      'POST /participants/check-duplicate': () => ({
        status: 200,
        body: {
          existe: true,
          participante: {
            id: 'part-uuid-1',
            nome: 'Maria da Silva',
            telefoneMascarado: '(**) *****-7777',
            cpfMascarado: '***.***.247-**',
            emailMascarado: null,
            camposDisponiveis: ['cpf'],
          },
        },
      }),
      [SUBMIT_PATH]: () => CREATED,
    });
    renderDialog();

    fireEvent.change(await screen.findByLabelText('CPF'), { target: { value: '52998224725' } });
    expect(await screen.findByText(/\(\*\*\) \*\*\*\*\*-7777/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reaproveitar cadastro' }));

    expect(screen.getByText(/Reaproveitando o cadastro de/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@exemplo.com' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Li o aviso para a pessoa/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));

    await waitFor(() =>
      expect(submitted(calls)).toEqual({
        reaproveitarParticipanteId: 'part-uuid-1',
        email: 'maria@exemplo.com',
        versaoAviso: '2026-10-30-provisoria',
        autorizaComunicados: false,
        autorizaImagem: false,
      }),
    );
  });

  it('inscricao repetida mostra a recusa, e falha inesperada a mensagem padrao', async () => {
    let status = 409;
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [SUBMIT_PATH]: () => ({
        status,
        body: {
          code: status === 409 ? 'ALREADY_REGISTERED' : 'INTERNAL',
          message: 'detalhe interno',
        },
      }),
    });
    renderDialog();

    await fillAdult();
    fireEvent.click(screen.getByRole('checkbox', { name: /Li o aviso para a pessoa/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));
    expect(
      await screen.findByText('Esta pessoa já possui inscrição ativa nesta atividade.'),
    ).toBeInTheDocument();

    status = 500;
    fireEvent.click(screen.getByRole('button', { name: 'Concluir inscrição' }));
    expect(
      await screen.findByText('Não foi possível registrar a inscrição. Tente de novo.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('detalhe interno')).not.toBeInTheDocument();
  });
});
