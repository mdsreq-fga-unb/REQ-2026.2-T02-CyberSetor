import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import type { Instrument } from '@/types/instrumentos';
import type { Goal } from '@/types/metas';
import type { Modality } from '@/types/modalidades';
import type { Project } from '@/types/projetos';
import { ActivityFormDialog } from './activity-form-dialog';

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

const MODALITY_ACTIVE: Modality = {
  id: '00000000-0000-4000-8000-000000000031',
  versao: 1,
  nome: 'Oficina Formativa',
  descricao: null,
  ativo: true,
};

const MODALITY_INACTIVE: Modality = {
  id: '00000000-0000-4000-8000-000000000032',
  versao: 1,
  nome: 'Modalidade Antiga',
  descricao: null,
  ativo: false,
};

const RESPONSIBLE_1 = {
  id: '00000000-0000-4000-8000-000000000041',
  nome: 'Carlos Instrutor',
};

const GOAL_1: Goal = {
  id: '00000000-0000-4000-8000-000000000051',
  versao: 1,
  projetoId: PROJECT.id,
  ordem: 1,
  origem: 'PROJETO',
  objetivo: 'Atender 100 jovens',
  descricao: 'Oficinas semanais',
  indicador: null,
  modalidadeAfericao: null,
  parametroPlanejado: null,
  unidade: null,
  periodoInicio: null,
  periodoFim: null,
  frequenciaApuracao: null,
  formaComprovacao: null,
  resultadoEsperado: null,
  requisitos: [],
  rascunho: false,
  camposFaltantes: [],
  responsavel: null,
  setor: null,
  situacao: 'PENDENTE',
  alertaPrazo: null,
  resultado: null,
};

const GOAL_2: Goal = {
  ...GOAL_1,
  id: '00000000-0000-4000-8000-000000000052',
  ordem: 2,
  objetivo: 'Apresentação final',
};

const ACTIVITY: Activity = {
  id: '00000000-0000-4000-8000-000000000060',
  versao: 1,
  projetoId: PROJECT.id,
  titulo: 'Oficina de Teatro — Turma A',
  modalidade: { id: MODALITY_ACTIVE.id, nome: MODALITY_ACTIVE.nome, ativo: true },
  responsavel: { id: RESPONSIBLE_1.id, nome: RESPONSIBLE_1.nome, ativo: true },
  data: '2026-05-10',
  local: 'Galpão SCS',
  inscricao: null,
  metas: [{ id: GOAL_1.id, ordem: GOAL_1.ordem, objetivo: GOAL_1.objetivo }],
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

function baseRoutes(extra: Record<string, Route> = {}) {
  return {
    'GET /modalities': () => ({ status: 200, body: [MODALITY_ACTIVE, MODALITY_INACTIVE] }),
    'GET /activities/eligible-responsibles': () => ({ status: 200, body: [RESPONSIBLE_1] }),
    [`GET /projects/${PROJECT.id}/goals`]: () => ({ status: 200, body: [GOAL_1, GOAL_2] }),
    ...extra,
  };
}

function renderDialog({
  activity = null,
  onClose = vi.fn(),
  onSaved = vi.fn(),
}: {
  activity?: Activity | null;
  onClose?: () => void;
  onSaved?: (a: Activity) => void;
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ActivityFormDialog
        open={true}
        project={PROJECT}
        activity={activity}
        onClose={onClose}
        onSaved={onSaved}
      />
    </QueryClientProvider>,
  );
}

describe('ActivityFormDialog', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.restoreAllMocks();
  });

  it('exibe campos vazios e valida campos obrigatorios no cadastro', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', baseRoutes());
    renderDialog();

    expect(await screen.findByRole('heading', { name: 'Cadastrar atividade' })).toBeInTheDocument();
    expect(await screen.findByText('Oficina Formativa')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nome / título da atividade' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Modalidade de objeto' })).toHaveValue('');
    expect(screen.getByLabelText('Data de realização')).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Local' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Responsável pela atividade' })).toHaveValue('');

    // Modalidade inativa nao deve ser listada para novo cadastro
    expect(screen.queryByText('Modalidade Antiga')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atividade' }));

    expect(await screen.findByText('Informe o título.')).toBeInTheDocument();
    expect(screen.getByText('Escolha a modalidade.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data completa.')).toBeInTheDocument();
    expect(screen.getByText('Informe o local.')).toBeInTheDocument();
    expect(screen.getByText('Escolha o responsável.')).toBeInTheDocument();
    expect(screen.getByText('Selecione ao menos uma meta.')).toBeInTheDocument();
  });

  it('recusa data fora do periodo de execucao do projeto', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', baseRoutes());
    renderDialog();

    await screen.findByText('Oficina Formativa');

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome / título da atividade' }), {
      target: { value: 'Oficina teste' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Modalidade de objeto' }), {
      target: { value: MODALITY_ACTIVE.id },
    });
    fireEvent.change(screen.getByLabelText('Data de realização'), {
      target: { value: '2026-01-15' }, // antes de 2026-02-01
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Local' }), {
      target: { value: 'Galpão' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Responsável pela atividade' }), {
      target: { value: RESPONSIBLE_1.id },
    });
    fireEvent.click(screen.getByLabelText(/Meta 1/));

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atividade' }));

    expect(
      await screen.findByText(/A data deve estar dentro do período de execução do projeto/),
    ).toBeInTheDocument();
  });

  it('cadastra atividade com sucesso chamando POST', async () => {
    const onSaved = vi.fn();
    const calls = await signedInAs(
      'PRESIDENCIA_GESTAO',
      baseRoutes({
        [`POST /projects/${PROJECT.id}/activities`]: (body) => ({
          status: 201,
          body: { ...ACTIVITY, ...(body as object), id: 'nova-id', versao: 1 },
        }),
      }),
    );
    renderDialog({ onSaved });

    await screen.findByText('Oficina Formativa');

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome / título da atividade' }), {
      target: { value: 'Oficina Nova' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Modalidade de objeto' }), {
      target: { value: MODALITY_ACTIVE.id },
    });
    fireEvent.change(screen.getByLabelText('Data de realização'), {
      target: { value: '2026-05-15' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Local' }), {
      target: { value: 'Sala 2' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Responsável pela atividade' }), {
      target: { value: RESPONSIBLE_1.id },
    });
    fireEvent.click(screen.getByLabelText(/Meta 1/));
    fireEvent.click(screen.getByLabelText(/Meta 2/));

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atividade' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));

    const postCall = calls.find((c) => c.key === `POST /projects/${PROJECT.id}/activities`);
    expect(postCall?.body).toEqual({
      titulo: 'Oficina Nova',
      modalidadeId: MODALITY_ACTIVE.id,
      data: '2026-05-15',
      local: 'Sala 2',
      responsavelId: RESPONSIBLE_1.id,
      metaIds: [GOAL_1.id, GOAL_2.id],
    });
  });

  it('preenche campos na edicao e permite atualizar com PATCH', async () => {
    const onSaved = vi.fn();
    const calls = await signedInAs(
      'PRESIDENCIA_GESTAO',
      baseRoutes({
        [`PATCH /activities/${ACTIVITY.id}`]: (body) => ({
          status: 200,
          body: { ...ACTIVITY, ...(body as object), versao: 2 },
        }),
      }),
    );
    renderDialog({ activity: ACTIVITY, onSaved });

    expect(await screen.findByRole('heading', { name: 'Editar atividade' })).toBeInTheDocument();
    expect(await screen.findByLabelText(/Meta 1/)).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Nome / título da atividade' })).toHaveValue(
      ACTIVITY.titulo,
    );
    expect(screen.getByRole('combobox', { name: 'Modalidade de objeto' })).toHaveValue(
      MODALITY_ACTIVE.id,
    );
    expect(screen.getByLabelText('Data de realização')).toHaveValue(ACTIVITY.data);
    expect(screen.getByRole('textbox', { name: 'Local' })).toHaveValue(ACTIVITY.local);
    expect(screen.getByRole('combobox', { name: 'Responsável pela atividade' })).toHaveValue(
      RESPONSIBLE_1.id,
    );
    expect(screen.getByLabelText(/Meta 2/)).not.toBeChecked();

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome / título da atividade' }), {
      target: { value: 'Oficina Atualizada' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atividade' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    const patchCall = calls.find((c) => c.key === `PATCH /activities/${ACTIVITY.id}`);
    expect(patchCall?.body).toMatchObject({
      titulo: 'Oficina Atualizada',
      versao: 1,
    });
  });

  it('exibe modalidade inativa no select de edicao com indicacao', async () => {
    const activityWithInactiveModality: Activity = {
      ...ACTIVITY,
      modalidade: { id: MODALITY_INACTIVE.id, nome: MODALITY_INACTIVE.nome, ativo: false },
    };
    await signedInAs('PRESIDENCIA_GESTAO', baseRoutes());
    renderDialog({ activity: activityWithInactiveModality });

    expect(await screen.findByRole('heading', { name: 'Editar atividade' })).toBeInTheDocument();
    expect(await screen.findByText('Modalidade Antiga (inativa)')).toBeInTheDocument();
  });

  it('lida com conflito de versao (409 VERSION_CONFLICT) recarregando a versao atual', async () => {
    const fresh: Activity = {
      ...ACTIVITY,
      versao: 2,
      titulo: 'Oficina Modificada por Outro',
    };
    await signedInAs(
      'PRESIDENCIA_GESTAO',
      baseRoutes({
        [`PATCH /activities/${ACTIVITY.id}`]: () => ({
          status: 409,
          body: { code: 'VERSION_CONFLICT', message: 'Conflito de versão' },
        }),
        [`GET /activities/${ACTIVITY.id}`]: () => ({
          status: 200,
          body: fresh,
        }),
      }),
    );
    renderDialog({ activity: ACTIVITY });

    await screen.findByRole('heading', { name: 'Editar atividade' });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atividade' }));

    expect(
      await screen.findByText(
        /Outra pessoa alterou esta atividade. Os campos mostram a versão atual/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nome / título da atividade' })).toHaveValue(
      'Oficina Modificada por Outro',
    );
  });
});
