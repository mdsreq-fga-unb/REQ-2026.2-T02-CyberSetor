import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Instrument } from '@/types/instrumentos';
import type { Goal } from '@/types/metas';
import type { Project } from '@/types/projetos';
import type { Requirement } from '@/types/requisitos';
import { ProjectGoalsView } from './project-goals-view';

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000401',
  versao: 1,
  tipo: 'PARCERIA',
  orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
  numeroProcesso: '71000.057425/2025-03',
  valorGlobal: '300000.00',
  dataCelebracao: '2025-11-07',
  vigenciaInicio: '2025-12-31',
  vigenciaFim: '2026-07-26',
  ativo: true,
};

const PROJECT: Project = {
  id: '00000000-0000-4000-8000-000000000501',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  codigo: 'P01',
  titulo: 'Oficinas de dança no Setor Comercial Sul',
  coordenador: { id: '00000000-0000-4000-8000-000000000601', nome: 'Ana Pedagógica', ativo: true },
  inicio: '2026-01-05',
  fim: '2026-07-20',
};

const REQUIREMENTS: Requirement[] = [
  {
    id: '00000000-0000-4000-8000-000000000701',
    versao: 1,
    instrumentoId: INSTRUMENT.id,
    descricao: 'Frequência mínima de 70% dos participantes nas oficinas',
    referencia: 'TR, item 24.1',
  },
  {
    id: '00000000-0000-4000-8000-000000000702',
    versao: 1,
    instrumentoId: INSTRUMENT.id,
    descricao: 'Certificado para quem concluir a formação',
    referencia: null,
  },
];

const BASE: Goal = {
  id: '00000000-0000-4000-8000-000000000801',
  versao: 1,
  projetoId: PROJECT.id,
  ordem: 1,
  origem: 'EDITAL',
  objetivo: 'Promover a formação artística de jovens do Setor Comercial Sul',
  descricao: 'Realizar oficinas de dança contemporânea com 120 participantes',
  indicador: 'Participantes com frequência mínima de 70%',
  modalidadeAfericao: 'QUANTITATIVA',
  parametroPlanejado: '120',
  unidade: 'participantes',
  periodoInicio: '2026-01-05',
  periodoFim: '2026-06-30',
  frequenciaApuracao: 'Mensal',
  formaComprovacao: 'Listas de presença e relatório fotográfico',
  resultadoEsperado: null,
  requisitos: REQUIREMENTS.map(({ id, referencia, descricao }) => ({ id, referencia, descricao })),
  rascunho: false,
  camposFaltantes: [],
  responsavel: { id: '00000000-0000-4000-8000-000000000601', nome: 'Ana Pedagógica', ativo: true },
  setor: {
    id: '00000000-0000-4000-8000-000000000901',
    nome: 'Coordenação Pedagógica',
    ativo: true,
  },
  situacao: 'EM_ANDAMENTO',
  alertaPrazo: 'VENCENDO',
};

const GOALS: Goal[] = [
  BASE,
  {
    ...BASE,
    id: '00000000-0000-4000-8000-000000000802',
    ordem: 2,
    origem: 'PROJETO',
    descricao: 'Apresentação pública ao fim das oficinas',
    indicador: null,
    modalidadeAfericao: null,
    parametroPlanejado: null,
    unidade: null,
    periodoInicio: null,
    periodoFim: null,
    formaComprovacao: null,
    requisitos: [BASE.requisitos[0]],
    rascunho: true,
    camposFaltantes: ['indicador', 'formaComprovacao', 'periodoInicio', 'periodoFim'],
    responsavel: null,
    setor: null,
    situacao: 'PENDENTE',
    alertaPrazo: null,
  },
  {
    ...BASE,
    id: '00000000-0000-4000-8000-000000000803',
    ordem: 3,
    objetivo: 'Certificar os participantes',
    descricao: 'Emitir certificado para quem concluir a formação',
    indicador: 'Certificados emitidos',
    parametroPlanejado: '84',
    periodoInicio: '2026-06-01',
    periodoFim: '2026-07-20',
    requisitos: [BASE.requisitos[1]],
    situacao: 'PENDENTE',
    alertaPrazo: 'VENCIDA',
  },
];

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 1800],
  ['desktop', 1280, 1000],
])('metas do projeto no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          return json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false });
        }
        if (url.endsWith('/activities')) return json([]);
        if (url.endsWith('/auth/session')) {
          return json({ usuarioId: 'gestao', perfil: 'PRESIDENCIA_GESTAO', setor: null });
        }
        if (url.endsWith('/goals')) return json(GOALS);
        if (url.endsWith('/requirements')) return json(REQUIREMENTS);
        if (url.includes('/projects/')) return json(PROJECT);
        return json(INSTRUMENT);
      }),
    );
    await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('projeto, metas com rascunho identificado e acoes', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <ProjectGoalsView instrumentId={INSTRUMENT.id} projectId={PROJECT.id} />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Rascunho')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`metas-${device}`);
  });

  it.runIf(width >= 768)('quadro por situacao', async () => {
    window.localStorage.setItem('cybersetor-metas-visao', 'QUADRO');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <ProjectGoalsView instrumentId={INSTRUMENT.id} projectId={PROJECT.id} />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('Em andamento (1)')).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`metas-quadro-${device}`);
  });
});
