import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Instrument, InstrumentDocument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import type { Requirement } from '@/types/requisitos';
import { InstrumentProjectsView } from './instrument-projects-view';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000401',
  versao: 1,
  tipo: 'EMENDA',
  orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
  numeroProcesso: '00150-00001234/2026-11',
  valorGlobal: '150000.00',
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
  ativo: true,
  documentoFormalEm: null,
};

const PROJECTS: Project[] = Array.from({ length: 12 }, (_, index) => ({
  id: `00000000-0000-4000-8000-0000000005${String(index).padStart(2, '0')}`,
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  codigo: `P${String(index + 1).padStart(2, '0')}`,
  titulo: `Oficinas de dança e teatro no Setor Comercial Sul, turma ${index + 1}`,
  coordenador: {
    id: `00000000-0000-4000-8000-0000000006${String(index % 3).padStart(2, '0')}`,
    nome: ['Ana Pedagógica', 'Beatriz Gestão', 'Fábio Desativado'][index % 3],
    ativo: index % 3 !== 2,
  },
  inicio: '2026-05-01',
  fim: '2026-12-15',
}));

const REQUIREMENTS: Requirement[] = [
  ['Frequência mínima de 70% dos participantes nas oficinas', 'Termo de referência, item 24.1'],
  ['Certificado para quem concluir a formação', null],
  ['Relatório fotográfico de cada encontro, com data e local', 'Plano de trabalho, meta 1'],
].map(([descricao, referencia], index) => ({
  id: `00000000-0000-4000-8000-0000000007${String(index).padStart(2, '0')}`,
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  descricao: descricao as string,
  referencia,
}));

const DOCUMENT: InstrumentDocument = {
  nomeArquivo: 'Termo de Fomento 12-2026 - assinado.pdf',
  tipoConteudo: 'application/pdf',
  tamanho: 1_572_864,
  sha256: 'a'.repeat(64),
  enviadoEm: '2026-10-27T13:05:00.000Z',
  enviadoPor: { id: '00000000-0000-4000-8000-000000000601', nome: 'Beatriz Gestão' },
  url: 'https://anexos.example/termo.pdf',
  expiraEm: '2026-10-27T13:10:00.000Z',
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe.each([
  ['celular', 360, 2900],
  ['desktop', 1280, 1400],
])('projetos do instrumento no %s', (device, width, height) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/login')) {
          return json({ accessToken: 't', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false });
        }
        if (url.endsWith('/requirements')) return json(REQUIREMENTS);
        if (url.endsWith('/document')) return json(DOCUMENT);
        return json(url.endsWith('/projects') ? PROJECTS : INSTRUMENT);
      }),
    );
    await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  });

  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('instrumento, lista com coordenacao e execucao, e paginacao', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <div data-testid="frame" className="flex flex-col gap-6 bg-background p-4 text-foreground">
          <InstrumentProjectsView instrumentId={INSTRUMENT.id} />
        </div>
      </QueryClientProvider>,
    );

    await expect.element(screen.getByText('1–10 de 12')).toBeVisible();
    await expect
      .element(screen.getByText('Certificado para quem concluir a formação'))
      .toBeVisible();
    await expect.element(screen.getByText(DOCUMENT.nomeArquivo)).toBeVisible();
    await expect.element(screen.getByTestId('frame')).toMatchScreenshot(`projetos-${device}`);
  });
});
