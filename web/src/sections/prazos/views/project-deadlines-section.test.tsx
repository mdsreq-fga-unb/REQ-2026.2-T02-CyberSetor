import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import { Button } from '@/components/ui/button';
import type { ProjectTimeline } from '@/types/prazos';
import { ProjectDeadlinesSection } from './project-deadlines-section';
import { NO_GOALS, PROJECT_ID, TIMELINE } from './project-deadlines-fixtures';

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

async function respondWith(...answers: [number, ProjectTimeline | object][]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith('/auth/login')) {
        return json(200, {
          accessToken: 't',
          perfil: 'PRESIDENCIA_GESTAO',
          deveTrocarSenha: false,
        });
      }
      const [status, body] = answers.length > 1 ? answers.shift()! : answers[0];
      return json(status, body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
}

function renderSection(createGoal?: React.ReactNode, onSelectGoal?: (metaId: string) => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ProjectDeadlinesSection
        projectId={PROJECT_ID}
        createGoal={createGoal}
        onSelectGoal={onSelectGoal}
      />
    </QueryClientProvider>,
  );
}

describe('painel de prazos do projeto', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('mostra a vigencia, os prazos com responsaveis e os marcos em ordem (CA-02b.1)', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    const region = await screen.findByRole('region', { name: 'Linha do tempo' });
    const items = within(region)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(items[0]).toContain('Início da vigência do instrumento');
    expect(items.findIndex((text) => text?.startsWith('Hoje'))).toBeGreaterThan(
      items.findIndex((text) => text?.includes('Meta 1 ·')),
    );
    expect(items.some((text) => text?.includes('Fim da vigência do instrumento'))).toBe(true);
    expect(within(region).getAllByText(/Responsável: Ana Pedagógica/).length).toBeGreaterThan(0);
    expect(within(region).getAllByText(/Setor: Coordenação Pedagógica/).length).toBeGreaterThan(0);
    expect(within(region).getByText('Metas sem prazo definido')).toBeInTheDocument();
    expect(region.querySelector('[aria-current="date"]')).toHaveTextContent('Hoje');

    const term = within(screen.getByRole('region', { name: 'Vigência do instrumento' }));
    expect(term.getByText('Faltam 189 dias')).toBeInTheDocument();
    expect(term.getByRole('link', { name: '71000.057425/2025-03' })).toHaveAttribute(
      'href',
      `/instrumentos/${TIMELINE.instrumento.id}`,
    );
  });

  it('marca a meta fora da vigencia, a concluida e a situacao (CA-14.5, CA-02a.2)', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    const region = within(await screen.findByRole('region', { name: 'Linha do tempo' }));
    expect(region.getByText('Fora da vigência')).toBeInTheDocument();
    expect(region.getByText('Prazo 31/03/2026 · Concluída')).toBeInTheDocument();
    expect(region.getByText('Prazo 10/06/2026 · Em andamento')).toBeInTheDocument();
  });

  it('destaca vencida, prazo proximo e meta sem responsavel (CA-02b.2, CA-02b.3)', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    const region = within(await screen.findByRole('region', { name: 'Prazos das metas' }));
    expect(region.getByText('Vencida há 10 dias')).toBeInTheDocument();
    expect(region.getByText('Vence em 15 dias')).toBeInTheDocument();
    expect(region.getByText('Sem responsável')).toBeInTheDocument();
    expect(region.queryByText(/Mapear as famílias/)).not.toBeInTheDocument();
  });

  it('a pendencia leva a propria meta e mostra o setor do responsavel', async () => {
    await respondWith([200, TIMELINE]);
    const onSelectGoal = vi.fn();
    renderSection(undefined, onSelectGoal);

    const region = within(await screen.findByRole('region', { name: 'Prazos das metas' }));
    expect(region.getAllByText(/Setor: Coordenação Pedagógica/).length).toBeGreaterThan(0);
    fireEvent.click(region.getByRole('button', { name: /Publicar o calendário das oficinas/ }));
    expect(onSelectGoal).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000801');
  });

  it('resume as pendencias e os requisitos atendidos nos numeros do painel', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    const widget = (await screen.findByRole('heading', { name: 'Requisitos atendidos' }))
      .parentElement as HTMLElement;
    expect(within(widget).getByText('1')).toBeInTheDocument();
    expect(within(widget).getByText('De 3 do instrumento')).toBeInTheDocument();
  });

  it('informa a situacao de cada requisito e as metas de outro projeto (RN-01)', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    const region = within(await screen.findByRole('region', { name: 'Requisitos do instrumento' }));
    expect(region.getByText('Atendido')).toBeInTheDocument();
    expect(region.getByText('Pendente')).toBeInTheDocument();
    expect(region.getByText('Sem meta vinculada')).toBeInTheDocument();
    expect(region.getByText('P02 · Meta 1 · Concluída · Cumprida')).toBeInTheDocument();
    expect(region.getByText('Meta 3 · Em andamento · Parcialmente cumprida')).toBeInTheDocument();
  });

  it('projeto sem meta indica o cadastro com a acao recebida (CA-02b.5)', async () => {
    await respondWith([200, NO_GOALS]);
    renderSection(<Button>Nova meta</Button>);

    expect(await screen.findByRole('button', { name: 'Nova meta' })).toBeInTheDocument();
    expect(
      screen.getByText('Cadastre as metas do projeto para acompanhar os prazos aqui.'),
    ).toBeInTheDocument();
  });

  it('quem so consulta ve o aviso sem acao de cadastro', async () => {
    await respondWith([200, NO_GOALS]);
    renderSection();

    expect(
      await screen.findByText(
        'Os prazos aparecem aqui depois que a gestão cadastrar as metas do projeto.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('com metas e sem pendencia, informa que nao ha pendencia de prazo (CA-02b.5)', async () => {
    await respondWith([
      200,
      {
        ...TIMELINE,
        pendencias: { metas: 1, vencendo: 0, vencidas: 0, semResponsavel: 0 },
        metas: [TIMELINE.metas[3]],
      },
    ]);
    renderSection();

    const region = within(await screen.findByRole('region', { name: 'Prazos das metas' }));
    expect(region.getByText('Nenhuma pendência de prazo.')).toBeInTheDocument();
  });

  it('instrumento sem requisitos mostra o estado vazio', async () => {
    await respondWith([200, { ...TIMELINE, requisitos: [] }]);
    renderSection();

    expect(
      await screen.findByText('O instrumento ainda não tem requisitos cadastrados.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nenhum requisito cadastrado')).toBeInTheDocument();
  });

  it('indica o carregamento mantendo o titulo', async () => {
    await respondWith([200, TIMELINE]);
    renderSection();

    expect(screen.getByRole('heading', { name: 'Prazos' })).toBeInTheDocument();
    expect(screen.getByLabelText('Carregando os prazos do projeto')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await screen.findByRole('region', { name: 'Linha do tempo' });
  });

  it('falha de carregamento diz o que fazer e tenta de novo', async () => {
    await respondWith([500, { code: 'ERRO', message: 'falhou' }], [200, TIMELINE]);
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os prazos do projeto.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('region', { name: 'Linha do tempo' })).toBeInTheDocument();
  });

  it('recusa por perfil tem mensagem propria', async () => {
    await respondWith([403, { code: 'FORBIDDEN', message: 'recusado' }]);
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O seu perfil não consulta os prazos deste projeto.',
    );
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument();
  });
});
