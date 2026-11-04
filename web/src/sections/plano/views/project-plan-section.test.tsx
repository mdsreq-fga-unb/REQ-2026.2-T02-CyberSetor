import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Goal } from '@/types/metas';
import type { WorkPlan } from '@/types/plano';
import { ProjectPlanSection } from './project-plan-section';

const PROJECT_ID = '00000000-0000-4000-8000-000000000010';
const PLAN = `GET /projects/${PROJECT_ID}/plan-versions`;
const CREATE = `POST /projects/${PROJECT_ID}/plan-versions`;

const GOAL = {
  id: 'meta-1',
  versao: 3,
  ordem: 1,
  objetivo: 'Formar jovens',
  parametroPlanejado: '100',
  periodoFim: '2026-06-30',
} as Goal;

const EMPTY: WorkPlan = { versoes: [], repactuadas: [], foraDaVigencia: [] };

const WITH_VERSION: WorkPlan = {
  versoes: [
    {
      id: 'v2',
      numero: 2,
      tipo: 'TERMO_ADITIVO',
      dataDocumento: '2026-07-01',
      documentoOrigem: 'Termo Aditivo 1/2026',
      publicacao: null,
      justificativa: null,
      vigenciaFimAnterior: null,
      vigenciaFimNova: null,
      registradoPor: { id: 'u1', nome: 'Beatriz Gestão' },
      criadoEm: '2026-07-02T13:00:00.000Z',
      metas: [],
    },
  ],
  repactuadas: [
    {
      metaId: 'meta-1',
      ordem: 1,
      objetivo: 'Formar jovens',
      unidade: 'participantes',
      previstoOriginal: '100',
      reprogramado: '120',
      realizado: 80,
      realizadoEm: '2026-05-01',
    },
  ],
  foraDaVigencia: ['meta-1'],
};

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedIn(routes: Record<string, Route>) {
  const calls: { key: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
      calls.push({ key, body });
      if (key === 'POST /auth/login') {
        return json(200, {
          accessToken: 't',
          perfil: 'PRESIDENCIA_GESTAO',
          deveTrocarSenha: false,
        });
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

function renderSection(canRegister = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <ProjectPlanSection projectId={PROJECT_ID} goals={[GOAL]} canRegister={canRegister} />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('ProjectPlanSection', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('sem registro, mostra so a versao original, sem comparativo (CA-14.6)', async () => {
    await signedIn({ [PLAN]: () => ({ status: 200, body: EMPTY }) });
    renderSection();

    expect(await screen.findByText(/Pactuação original/)).toBeInTheDocument();
    expect(screen.queryByText('Metas repactuadas')).not.toBeInTheDocument();
  });

  it('mostra o comparativo, a versao e a meta fora da vigencia (CA-14.3, CA-14.5)', async () => {
    await signedIn({ [PLAN]: () => ({ status: 200, body: WITH_VERSION }) });
    renderSection();

    expect(await screen.findByText('Metas repactuadas')).toBeInTheDocument();
    expect(screen.getByText('100 participantes')).toBeInTheDocument();
    expect(screen.getByText('120 participantes')).toBeInTheDocument();
    expect(screen.getByText('80 participantes')).toBeInTheDocument();
    expect(screen.getByText(/Termo Aditivo 1\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/A meta 1 tem prazo fora da vigência/)).toBeInTheDocument();
  });

  it('sem permissao, nao oferece o registro', async () => {
    await signedIn({ [PLAN]: () => ({ status: 200, body: EMPTY }) });
    renderSection(false);

    await screen.findByText(/Pactuação original/);
    expect(
      screen.queryByRole('button', { name: 'Registrar aditivo, apostila ou ofício' }),
    ).not.toBeInTheDocument();
  });

  it('registra o termo aditivo em duas etapas e envia so a meta alterada (CA-14.1)', async () => {
    const calls = await signedIn({
      [PLAN]: () => ({ status: 200, body: EMPTY }),
      [CREATE]: () => ({ status: 201, body: { ...WITH_VERSION.versoes[0], numero: 2 } }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Registrar aditivo, apostila ou ofício' }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('Informe o documento de origem.')).toBeInTheDocument();

    fill('Data do documento', '2026-07-01');
    fill('Documento de origem', 'Termo Aditivo 1/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await screen.findByLabelText('Novo parâmetro da meta 1');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar versão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe a mudança de ao menos uma meta.',
    );
    fill('Novo parâmetro da meta 1', '120');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar versão' }));

    expect(await screen.findByText('Versão 2 do plano registrada')).toBeInTheDocument();
    expect(calls.find((call) => call.key === CREATE)?.body).toEqual({
      tipo: 'TERMO_ADITIVO',
      dataDocumento: '2026-07-01',
      documentoOrigem: 'Termo Aditivo 1/2026',
      metas: [{ metaId: 'meta-1', versao: 3, parametroPlanejado: '120' }],
    });
  });

  it('o oficio exige publicacao, justificativa e vigencia, e dispensa meta (CA-14.4)', async () => {
    const calls = await signedIn({
      [PLAN]: () => ({ status: 200, body: EMPTY }),
      [CREATE]: () => ({ status: 201, body: { ...WITH_VERSION.versoes[0], numero: 2 } }),
    });
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Registrar aditivo, apostila ou ofício' }),
    );
    fill('Tipo de documento', 'OFICIO');
    fill('Data do documento', '2026-07-01');
    fill('Documento de origem', 'Ofício 10/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('Informe a publicação do ofício.')).toBeInTheDocument();

    fill('Publicação', 'DODF 120');
    fill('Novo fim da vigência', '2026-10-31');
    fill('Justificativa', 'Prazo reduzido pelo concedente.');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar versão' }));

    await waitFor(() =>
      expect(calls.find((call) => call.key === CREATE)?.body).toMatchObject({
        tipo: 'OFICIO',
        publicacao: 'DODF 120',
        justificativa: 'Prazo reduzido pelo concedente.',
        vigenciaFim: '2026-10-31',
        metas: [],
      }),
    );
  });

  it('recusa da API aparece no dialogo, e falha ao carregar oferece tentar de novo', async () => {
    let attempts = 0;
    await signedIn({
      [PLAN]: () => {
        attempts += 1;
        return attempts === 1
          ? { status: 500, body: { code: 'INTERNAL', message: 'erro' } }
          : { status: 200, body: EMPTY };
      },
      [CREATE]: () => ({
        status: 400,
        body: { code: 'OUTSIDE_PROJECT_EXECUTION', message: 'O período está fora da execução.' },
      }),
    });
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o plano de trabalho.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    await screen.findByText(/Pactuação original/);

    fireEvent.click(screen.getByRole('button', { name: 'Registrar aditivo, apostila ou ofício' }));
    fill('Data do documento', '2026-07-01');
    fill('Documento de origem', 'Apostila 1/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.change(await screen.findByLabelText('Novo fim da meta 1'), {
      target: { value: '2027-03-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar versão' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('O período está fora da execução.');
  });
});
