import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import type { RegisteredPerson, SituacaoInscricao } from '@/types/inscricoes';
import type { Instrument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import { ProjectActivitiesSection } from './project-activities-section';

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000001',
  versao: 1,
  tipo: 'PARCERIA',
  orgaoConcedente: 'Ministério da Cultura',
  numeroProcesso: '01400.000123/2026-11',
  valorGlobal: '150000.00',
  dataCelebracao: '2026-01-01',
  vigenciaInicio: '2026-01-01',
  vigenciaFim: '2026-12-31',
  ativo: true,
  documentoFormalEm: null,
};

const PROJECT: Project = {
  id: '00000000-0000-4000-8000-000000000010',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  codigo: 'PRJ-01',
  titulo: 'Oficinas de Arte',
  coordenador: {
    id: '00000000-0000-4000-8000-000000000020',
    nome: 'Maria Clara',
    ativo: true,
  },
  inicio: '2026-02-01',
  fim: '2026-11-30',
};

const ACTIVITY_1: Activity = {
  id: '00000000-0000-4000-8000-000000000061',
  versao: 1,
  projetoId: PROJECT.id,
  titulo: 'Oficina de Teatro — Turma A',
  modalidade: { id: 'm1', nome: 'Oficina Formativa', ativo: true },
  responsavel: { id: 'r1', nome: 'Carlos Instrutor', ativo: true },
  data: '2026-05-10',
  horaInicio: '09:00',
  horaFim: '12:30',
  cargaHorariaMinutos: 210,
  local: 'Galpão SCS',
  inscricao: null,
  metas: [{ id: 'meta-1', ordem: 1, objetivo: 'Atender 100 jovens' }],
};

const ACTIVITY_2: Activity = {
  id: '00000000-0000-4000-8000-000000000062',
  versao: 1,
  projetoId: PROJECT.id,
  titulo: 'Ensaio Geral Aberto',
  modalidade: { id: 'm2', nome: 'Apresentação Pública', ativo: true },
  responsavel: { id: 'r2', nome: 'Juliana Educadora', ativo: false },
  data: '2026-06-20',
  horaInicio: null,
  horaFim: null,
  cargaHorariaMinutos: null,
  local: 'Praça Central',
  inscricao: null,
  metas: [
    { id: 'meta-1', ordem: 1, objetivo: 'Atender 100 jovens' },
    { id: 'meta-2', ordem: 2, objetivo: 'Apresentação final' },
  ],
};

type Route = (
  body: unknown,
) => { status: number; body?: unknown } | Promise<{ status: number; body?: unknown }>;

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function person(
  nome: string,
  situacao: SituacaoInscricao,
  posicaoEspera: number | null,
): RegisteredPerson {
  return {
    id: `inscricao-${nome}`,
    participanteId: `participante-${nome}`,
    nome,
    idade: 30,
    menor: false,
    telefone: '61999998888',
    email: null,
    situacao,
    posicaoEspera,
    inscritoEm: '2026-10-28T13:00:00.000Z',
    autorizaComunicados: true,
    autorizaImagem: false,
    responsavelNome: null,
    responsavelTelefone: null,
    cancelamento: null,
  };
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
      const result = await route(body);
      return json(result.status, result.body);
    }),
  );
  await signIn('teste@instituto.org.br', 'senha-de-teste-longa');
  return calls;
}

function renderSection(instrument = INSTRUMENT, project = PROJECT) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ProjectActivitiesSection instrument={instrument} project={project} />
    </QueryClientProvider>,
  );
}

describe('ProjectActivitiesSection', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.restoreAllMocks();
  });

  it('exibe estado vazio quando nao ha atividades cadastradas', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({ status: 200, body: [] }),
    });
    renderSection();

    expect(
      await screen.findByText('Nenhuma atividade cadastrada neste projeto'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Nova atividade' }).length).toBeGreaterThan(0);
  });

  it('exibe mensagem de erro quando falha ao carregar com 403', async () => {
    await signedInAs('CONCEDENTE_AUDITORIA', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 403,
        body: { code: 'FORBIDDEN', message: 'Sem permissão' },
      }),
    });
    renderSection();

    expect(await screen.findByText('O seu perfil não consulta atividades.')).toBeInTheDocument();
  });

  it('renderiza tabela de atividades com badges de metas e responsavel inativo indicado', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [ACTIVITY_1, ACTIVITY_2],
      }),
    });
    renderSection();

    expect(await screen.findByText('Oficina de Teatro — Turma A')).toBeInTheDocument();
    expect(screen.getByText('Oficina Formativa')).toBeInTheDocument();
    expect(screen.getAllByText('Meta 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Meta 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Carlos Instrutor').length).toBeGreaterThan(0);

    // Horario e carga horaria; a atividade anterior ao horario mostra so a data
    expect(screen.getAllByText(/10\/05\/2026 · 9h às 12h30 · 3 h 30 min/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('20/06/2026').length).toBeGreaterThan(0);

    // Responsavel desativado (Juliana Educadora)
    expect(screen.getAllByText('Juliana Educadora').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Conta desativada').length).toBeGreaterThan(0);

    // Botoes de acoes para perfil de gestao
    expect(screen.getByRole('button', { name: 'Nova atividade' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    ).toBeInTheDocument();
  });

  it('mostra a situacao da inscricao com a acao visivel de abrir ou divulgar', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [
          { ...ACTIVITY_1, inscricao: { aberta: true, vagas: 30, inscritos: 12, emEspera: 0 } },
          ACTIVITY_2,
        ],
      }),
    });
    renderSection();

    expect((await screen.findAllByText('Inscrição aberta · 12 de 30')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inscrição não aberta').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: `Abrir inscrição de ${ACTIVITY_2.titulo}` }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: `Divulgar a inscrição de ${ACTIVITY_1.titulo}` }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Divulgar inscrição da atividade' }),
    ).toBeInTheDocument();
  });

  it('perfil de consulta ve a situacao da inscricao sem as acoes', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [
          { ...ACTIVITY_1, inscricao: { aberta: false, vagas: 30, inscritos: 30, emEspera: 2 } },
        ],
      }),
    });
    renderSection();

    expect(
      (await screen.findAllByText('Inscrição encerrada · 30 de 30 · 2 na espera')).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /Divulgar/ })).not.toBeInTheDocument();
  });

  it('mostra quando as vagas foram preenchidas com a inscricao ainda aberta', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 30, inscritos: 30 } }],
      }),
    });
    renderSection();

    expect((await screen.findAllByText('Vagas preenchidas · 30 de 30')).length).toBeGreaterThan(0);
  });

  it('encerra a inscricao pelo menu da atividade com a versao atual', async () => {
    let aberta = true;
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta, vagas: 30, inscritos: 12 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registration`]: () => ({
        status: 200,
        body: { atividadeId: ACTIVITY_1.id, versao: 4, aberta, vagas: 30 },
      }),
      [`PATCH /activities/${ACTIVITY_1.id}/registration`]: (body) => {
        aberta = (body as { aberta: boolean }).aberta;
        return { status: 200, body: { atividadeId: ACTIVITY_1.id, versao: 5, aberta, vagas: 30 } };
      },
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Encerrar inscrições' }));
    expect(await screen.findByText(/Quem já se inscreveu continua inscrito/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar inscrições' }));

    expect((await screen.findAllByText('Inscrição encerrada · 12 de 30')).length).toBeGreaterThan(
      0,
    );
    expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
      versao: 4,
      aberta: false,
    });
  });

  it('reabrir com o prazo vencido pede um prazo novo e envia com ele', async () => {
    const dia = (offset: number) =>
      new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    const atividade = { ...ACTIVITY_1, data: dia(30) };
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...atividade, inscricao: { aberta: false, vagas: 30, inscritos: 12 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registration`]: () => ({
        status: 200,
        body: {
          atividadeId: ACTIVITY_1.id,
          versao: 3,
          aberta: false,
          vagas: 30,
          prazoInscricao: dia(-2),
          prazoHora: '18:00',
        },
      }),
      [`PATCH /activities/${ACTIVITY_1.id}/registration`]: (body) => ({
        status: 200,
        body: { atividadeId: ACTIVITY_1.id, versao: 4, vagas: 30, ...(body as object) },
      }),
    });
    const patch = () => calls.find((c) => c.key.startsWith('PATCH'));
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reabrir inscrições' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reabrir inscrições' }));

    expect(await screen.findByText(/O prazo de inscrição terminou em/)).toBeInTheDocument();
    expect(patch()).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: 'Reabrir inscrições' }));
    expect(await screen.findByText('Informe a data do prazo novo.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Inscrições até'), { target: { value: dia(5) } });
    fireEvent.click(screen.getByRole('button', { name: 'Reabrir inscrições' }));

    await waitFor(() =>
      expect(patch()?.body).toEqual({
        versao: 3,
        aberta: true,
        prazoInscricao: dia(5),
        prazoHora: null,
      }),
    );
  });

  it('oferece reabrir a inscricao encerrada e mostra a recusa do servidor', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: false, vagas: 30, inscritos: 12 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registration`]: () => ({
        status: 200,
        body: { atividadeId: ACTIVITY_1.id, versao: 2, aberta: false, vagas: 30 },
      }),
      [`PATCH /activities/${ACTIVITY_1.id}/registration`]: () => ({
        status: 403,
        body: { code: 'FORBIDDEN', message: 'Sem permissão' },
      }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reabrir inscrições' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reabrir inscrições' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O seu perfil não tem permissão para alterar a inscrição desta atividade.',
    );
  });

  it('atividade sem inscricao nao oferece encerrar nem link', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({ status: 200, body: [ACTIVITY_1] }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    expect(await screen.findByRole('menuitem', { name: 'Abrir inscrição' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Encerrar|Link e QR Code/ })).toBeNull();
  });

  it('Nucleo ve os inscritos confirmados e a lista de espera pela posicao', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 1, inscritos: 1, emEspera: 1 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () => ({
        status: 200,
        body: {
          vagas: 1,
          confirmadas: 1,
          emEspera: 1,
          canceladas: 0,
          inscricoes: [
            person('Ana Souza', 'CONFIRMADA', null),
            {
              ...person('Bruno Lima', 'LISTA_ESPERA', 1),
              menor: true,
              responsavelNome: 'Carla Lima',
            },
          ],
        },
      }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver inscritos' }));

    expect(
      await screen.findByText('1 de 1 vagas confirmadas · 1 na lista de espera'),
    ).toBeInTheDocument();
    const confirmadas = screen.getByRole('region', { name: 'Vagas confirmadas (1)' });
    expect(within(confirmadas).getByText('Ana Souza')).toBeInTheDocument();
    const espera = screen.getByRole('region', { name: 'Lista de espera (1)' });
    expect(within(espera).getByText(/1º ·/)).toBeInTheDocument();
    expect(within(espera).getByText('Bruno Lima', { exact: false })).toBeInTheDocument();
    expect(within(espera).getByText('Menor')).toBeInTheDocument();
    expect(within(espera).getByText(/Responsável: Carla Lima/)).toBeInTheDocument();

    // Sem vaga livre, a pessoa da espera só pode ter a inscrição cancelada.
    fireEvent.click(within(espera).getByRole('button', { name: 'Ações de Bruno Lima' }));
    expect(await screen.findByRole('menuitem', { name: 'Cancelar inscrição' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Confirmar vaga' })).not.toBeInTheDocument();
  });

  const lista = (
    confirmadas: RegisteredPerson[],
    espera: RegisteredPerson[],
    canceladas: RegisteredPerson[] = [],
  ) => ({
    status: 200,
    body: {
      vagas: 2,
      confirmadas: confirmadas.length,
      emEspera: espera.length,
      canceladas: canceladas.length,
      inscricoes: [...confirmadas, ...espera, ...canceladas],
    },
  });

  async function openRegistrations() {
    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver inscritos' }));
  }

  it('cancela a inscricao com o canal e a data do pedido e mostra a cancelada a parte', async () => {
    const ana = person('Ana Souza', 'CONFIRMADA', null);
    const anaCancelada = {
      ...ana,
      situacao: 'CANCELADA' as const,
      cancelamento: { pedidoEm: '2026-10-29', canal: 'WHATSAPP' as const },
    };
    let cancelled = false;
    const calls = await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 2, inscritos: 1, emEspera: 0 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () =>
        cancelled ? lista([], [], [anaCancelada]) : lista([ana], []),
      [`POST /activities/${ACTIVITY_1.id}/registrations/${encodeURIComponent(ana.id)}/cancellation`]:
        () => {
          cancelled = true;
          return lista([], [], [anaCancelada]);
        },
    });
    renderSection();

    await openRegistrations();
    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Cancelar inscrição' }));
    expect(
      await screen.findByText(/A vaga de Ana Souza fica livre para uma nova inscrição/),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Canal do pedido'), { target: { value: 'WHATSAPP' } });
    fireEvent.change(screen.getByLabelText('Data do pedido'), { target: { value: '2026-10-29' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar inscrição' }));

    const canceladas = await screen.findByRole('region', { name: 'Canceladas (1)' });
    expect(
      within(canceladas).getByText('Cancelada a pedido em 29/10/2026 · WhatsApp'),
    ).toBeInTheDocument();
    expect(
      within(canceladas).queryByRole('columnheader', { name: 'Ações' }),
    ).not.toBeInTheDocument();
    expect(calls.find((c) => c.key.endsWith('/cancellation'))?.body).toEqual({
      canal: 'WHATSAPP',
      pedidoEm: '2026-10-29',
    });
  });

  it('com vaga livre, o Nucleo confirma a vaga de quem esta na espera', async () => {
    const ana = person('Ana Souza', 'CONFIRMADA', null);
    const bruno = person('Bruno Lima', 'LISTA_ESPERA', 1);
    const brunoConfirmado = { ...bruno, situacao: 'CONFIRMADA' as const, posicaoEspera: null };
    let confirmed = false;
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 2, inscritos: 1, emEspera: 1 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () =>
        confirmed ? lista([ana, brunoConfirmado], []) : lista([ana], [bruno]),
      [`POST /activities/${ACTIVITY_1.id}/registrations/${encodeURIComponent(bruno.id)}/confirmation`]:
        () => {
          confirmed = true;
          return lista([ana, brunoConfirmado], []);
        },
    });
    renderSection();

    await openRegistrations();
    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Bruno Lima' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Confirmar vaga' }));

    expect(
      await screen.findByRole('region', { name: 'Vagas confirmadas (2)' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Lista de espera/ })).not.toBeInTheDocument();
  });

  it('sem promocao automatica, o cancelamento avisa que o Nucleo escolhe quem confirmar', async () => {
    const ana = person('Ana Souza', 'CONFIRMADA', null);
    const bruno = person('Bruno Lima', 'LISTA_ESPERA', 1);
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 1, inscritos: 1, emEspera: 1 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () => lista([ana], [bruno]),
      [`GET /activities/${ACTIVITY_1.id}/registration`]: () => ({
        status: 200,
        body: { promocaoAutomatica: false, listaEspera: true },
      }),
    });
    renderSection();

    await openRegistrations();
    fireEvent.click(await screen.findByRole('button', { name: 'Ações de Ana Souza' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Cancelar inscrição' }));

    expect(
      await screen.findByText(/fica livre para o Núcleo confirmar alguém da lista de espera/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/passa para a primeira da lista de espera/)).not.toBeInTheDocument();
  });

  it('ao trocar de atividade, a lista de inscritos nao mostra as pessoas da anterior', async () => {
    let releaseSecond: () => void = () => undefined;
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [
          { ...ACTIVITY_1, inscricao: { aberta: true, vagas: 2, inscritos: 1, emEspera: 0 } },
          { ...ACTIVITY_2, inscricao: { aberta: true, vagas: 2, inscritos: 1, emEspera: 0 } },
        ],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () =>
        lista([person('Ana Souza', 'CONFIRMADA', null)], []),
      [`GET /activities/${ACTIVITY_2.id}/registrations`]: () =>
        new Promise((resolve) => {
          releaseSecond = () => resolve(lista([person('Caio Reis', 'CONFIRMADA', null)], []));
        }),
    });
    renderSection();

    await openRegistrations();
    expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(
      await screen.findByRole('button', { name: `Ações da atividade ${ACTIVITY_2.titulo}` }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver inscritos' }));

    expect(await screen.findByText(`Inscritos: ${ACTIVITY_2.titulo}`)).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();
    releaseSecond();
    expect(await screen.findByText('Caio Reis')).toBeInTheDocument();
  });

  it('com o instrumento inativo, o Nucleo ve os inscritos sem confirmar nem cancelar', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [{ ...ACTIVITY_1, inscricao: { aberta: true, vagas: 2, inscritos: 1, emEspera: 1 } }],
      }),
      [`GET /activities/${ACTIVITY_1.id}/registrations`]: () =>
        lista([person('Ana Souza', 'CONFIRMADA', null)], [person('Bruno Lima', 'LISTA_ESPERA', 1)]),
    });
    renderSection({ ...INSTRUMENT, ativo: false });

    await openRegistrations();

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ações de / })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Ações' })).not.toBeInTheDocument();
  });

  it('perfil de consulta (ADMINISTRATIVO_FINANCEIRO) consulta mas nao altera', async () => {
    await signedInAs('ADMINISTRATIVO_FINANCEIRO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [ACTIVITY_1],
      }),
    });
    renderSection();

    expect(await screen.findByText('Oficina de Teatro — Turma A')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova atividade' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    ).not.toBeInTheDocument();
  });

  it('instrumento inativo exibe aviso e nao permite cadastrar nem editar', async () => {
    const inactiveInstrument: Instrument = { ...INSTRUMENT, ativo: false };
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({
        status: 200,
        body: [ACTIVITY_1],
      }),
    });
    renderSection(inactiveInstrument);

    expect(await screen.findByText('Oficina de Teatro — Turma A')).toBeInTheDocument();
    expect(
      screen.getByText('Instrumento inativo: não recebe nem altera atividades.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova atividade' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `Ações da atividade ${ACTIVITY_1.titulo}` }),
    ).not.toBeInTheDocument();
  });

  it('abre o dialogo de cadastro ao clicar em Nova atividade', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /projects/${PROJECT.id}/activities`]: () => ({ status: 200, body: [] }),
      'GET /modalities': () => ({ status: 200, body: [] }),
      'GET /activities/eligible-responsibles': () => ({ status: 200, body: [] }),
      [`GET /projects/${PROJECT.id}/goals`]: () => ({ status: 200, body: [] }),
    });
    renderSection();

    await screen.findByText('Nenhuma atividade cadastrada neste projeto');
    const newBtn = screen.getAllByRole('button', { name: 'Nova atividade' })[0];
    fireEvent.click(newBtn);

    expect(await screen.findByRole('heading', { name: 'Cadastrar atividade' })).toBeInTheDocument();
  });
});
