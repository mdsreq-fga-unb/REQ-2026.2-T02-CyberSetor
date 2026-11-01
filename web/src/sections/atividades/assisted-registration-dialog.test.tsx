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
      if (key === 'GET /public/registrations/abc123xyz789') {
        return json(200, {
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
        });
      }
      const handler = routes[key];
      if (!handler) {
        return json(404, { message: `Sem mock para ${key}` });
      }
      const res = handler(body, parsed.searchParams);
      return json(res.status, res.body);
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

describe('AssistedRegistrationDialog (HU-08)', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.restoreAllMocks();
  });

  it('renderiza título, campos de identificação, aviso dinâmico para leitura e operador logado', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {});
    renderDialog();

    expect(screen.getByText(/Inscrição Presencial Assistida/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Inscrever participante em Oficina de Teatro — Turma A/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone com DDD \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data de nascimento \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF do participante \*/i)).toBeInTheDocument();
    expect(screen.getByText(/Núcleo Pedagógico/i)).toBeInTheDocument();

    // CA-08.4: Apresentação do aviso de tratamento de dados para leitura verbal
    await waitFor(() => {
      expect(
        screen.getByText(/Aviso oficial do Instituto Cultural e Social No Setor/i),
      ).toBeInTheDocument();
    });
  });

  it('exibe dinamicamente campos de responsável quando participante for menor de 18 anos', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {});
    renderDialog();

    // Digita data de alguém com 16 anos (nascido em 2010)
    const birthInput = screen.getByLabelText(/Data de nascimento \*/i);
    fireEvent.change(birthInput, { target: { value: '2010-05-15' } });

    await waitFor(() => {
      expect(
        screen.getByText(/Participante menor de 18 anos — dados do responsável obrigatórios/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome do responsável legal \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Telefone do responsável \*/i)).toBeInTheDocument();
    });
  });

  it('exibe aviso prévio de lista de espera quando as vagas estão esgotadas (CA-08.5)', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {});
    renderDialog({ activity: ACTIVITY_FULL });

    // Vagas esgotadas com 2 pessoas na espera -> próxima posição = 3ª
    expect(
      screen.getByText(/Vagas esgotadas: Esta inscrição entrará na Lista de Espera/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/3ª posição/i)).toBeInTheDocument();
  });

  it('detecta duplicidade via POST com dados mascarados e reaproveita cadastro existente (CA-08.3, RNF05)', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'POST /participants/check-duplicate': (body) => {
        const payload = body as { cpf?: string };
        if (payload.cpf === '52998224725') {
          return {
            status: 200,
            body: {
              existe: true,
              participante: {
                id: 'part-uuid-1',
                nome: 'Maria da Silva',
                telefoneMascarado: '61 9****-7777',
                cpfMascarado: '529.***.***-25',
                emailMascarado: 'm***@teste.com',
                camposDisponiveis: ['cpf', 'email', 'telefone'],
              },
            },
          };
        }
        return { status: 200, body: { existe: false, participante: null } };
      },
    });

    renderDialog();

    const cpfInput = screen.getByLabelText(/CPF do participante \*/i);
    fireEvent.change(cpfInput, { target: { value: '52998224725' } });

    // Aguarda debounce e exibição do aviso com dados mascarados
    await waitFor(() => {
      expect(screen.getByText(/Cadastro existente detectado na base/i)).toBeInTheDocument();
      expect(screen.getByText(/Maria da Silva/i)).toBeInTheDocument();
      expect(screen.getByText(/61 9\*\*\*\*-7777/i)).toBeInTheDocument();
    });

    // Clica em Reaproveitar cadastro
    const reaproveitarBtn = screen.getByRole('button', { name: /Reaproveitar cadastro/i });
    fireEvent.click(reaproveitarBtn);

    // Nome é preenchido e travado
    expect(screen.getByText(/Reaproveitando cadastro de/i)).toBeInTheDocument();
    const nomeInput = screen.getByLabelText(/Nome completo \*/i);
    expect(nomeInput).toHaveValue('Maria da Silva');
    expect(nomeInput).toBeDisabled();
  });

  it('submete inscrição assistida com sucesso informando vaga garantida', async () => {
    const onSuccess = vi.fn();
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      'POST /activities/00000000-0000-4000-8000-000000000060/registration/assisted': () => ({
        status: 201,
        body: {
          id: 'insc-1',
          situacao: 'CONFIRMADA',
          posicaoEspera: null,
          reaproveitouParticipante: false,
          participante: { id: 'part-1', nome: 'Carlos Adulto' },
          inscritoEm: '2026-11-01T10:00:00.000Z',
        },
      }),
    });

    renderDialog({ onSuccess });

    fireEvent.change(screen.getByLabelText(/Nome completo \*/i), {
      target: { value: 'Carlos Adulto' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone com DDD \*/i), {
      target: { value: '61981112233' },
    });
    fireEvent.change(screen.getByLabelText(/Data de nascimento \*/i), {
      target: { value: '1998-04-10' },
    });
    fireEvent.change(screen.getByLabelText(/CPF do participante \*/i), {
      target: { value: '52998224725' },
    });

    // Submete formulário
    fireEvent.click(screen.getByRole('button', { name: /Concluir inscrição/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    const submitCall = calls.find((c) =>
      c.key.includes('/activities/00000000-0000-4000-8000-000000000060/registration/assisted'),
    );
    expect(submitCall).toBeDefined();
    const body = submitCall?.body as Record<string, unknown>;
    expect(body.nome).toBe('Carlos Adulto');
    expect(body.cpf).toBe('52998224725');
  });

  it('exibe alerta de erro quando participante já possui inscrição na atividade', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      'POST /activities/00000000-0000-4000-8000-000000000060/registration/assisted': () => ({
        status: 409,
        body: {
          code: 'ALREADY_REGISTERED',
          message: 'Já existe uma inscrição com estes dados nesta atividade.',
        },
      }),
    });

    renderDialog();

    fireEvent.change(screen.getByLabelText(/Nome completo \*/i), {
      target: { value: 'Carlos Adulto' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone com DDD \*/i), {
      target: { value: '61981112233' },
    });
    fireEvent.change(screen.getByLabelText(/Data de nascimento \*/i), {
      target: { value: '1998-04-10' },
    });
    fireEvent.change(screen.getByLabelText(/CPF do participante \*/i), {
      target: { value: '52998224725' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Concluir inscrição/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Esta pessoa já possui inscrição ativa nesta atividade/i),
      ).toBeInTheDocument();
    });
  });
});
