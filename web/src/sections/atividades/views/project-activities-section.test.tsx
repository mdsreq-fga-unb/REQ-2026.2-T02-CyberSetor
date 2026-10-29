import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
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
  local: 'Praça Central',
  inscricao: null,
  metas: [
    { id: 'meta-1', ordem: 1, objetivo: 'Atender 100 jovens' },
    { id: 'meta-2', ordem: 2, objetivo: 'Apresentação final' },
  ],
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
          { ...ACTIVITY_1, inscricao: { aberta: true, vagas: 30, inscritos: 12 } },
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
        body: [{ ...ACTIVITY_1, inscricao: { aberta: false, vagas: 30, inscritos: 30 } }],
      }),
    });
    renderSection();

    expect((await screen.findAllByText('Inscrição encerrada · 30 de 30')).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByRole('button', { name: /Divulgar/ })).not.toBeInTheDocument();
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
