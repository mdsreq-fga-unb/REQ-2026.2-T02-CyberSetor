import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Dashboard } from '@/types/painel';
import { NUCLEO, PANEL } from './home-fixtures';
import { HomeView, panelSummary } from './home-view';

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInWith(perfil: string, dashboard: () => { status: number; body?: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname.replace(/^\/v1/, '');
      if (path === '/auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      if (path === '/dashboard') {
        const result = dashboard();
        return json(result.status, result.body);
      }
      if (path === '/health') return json(200, { status: 'ok', banco: 'ok' });
      return json(404, { code: 'NOT_FOUND', message: path });
    }),
  );
  await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <HomeView />
      </Toaster>
    </QueryClientProvider>,
  );
}

describe('tela inicial', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('cumprimenta pelo primeiro nome, com o perfil, o setor e o resumo do dia', async () => {
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: NUCLEO }));
    renderView();

    expect(await screen.findByRole('heading', { name: 'Olá, Maria' })).toBeInTheDocument();
    expect(screen.getByText('Núcleo Pedagógico e Educadores · Pedagógico')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Há 1 meta vencida, 2 metas com prazo nos próximos 30 dias e 1 meta sem responsável. Você responde por 3 metas.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/API conectada/)).not.toBeInTheDocument();
  });

  it('prazos com o destaque de vencida, sem responsavel e o link para o projeto', async () => {
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: NUCLEO }));
    renderView();

    const prazos = within(await screen.findByRole('region', { name: 'Prazos das metas' }));
    expect(prazos.getByText('Vencida há 3 dias')).toBeInTheDocument();
    expect(prazos.getByText('Vence hoje')).toBeInTheDocument();
    expect(prazos.getByText('Vence em 23 dias')).toBeInTheDocument();
    expect(prazos.getByText('Sem responsável')).toBeInTheDocument();
    expect(prazos.getByText('Conta desativada')).toBeInTheDocument();
    expect(
      prazos.getByRole('link', { name: 'Meta 4 · Entregar o relatório parcial' }),
    ).toHaveAttribute(
      'href',
      '/instrumentos/00000000-0000-4000-8000-000000000101/projetos/00000000-0000-4000-8000-000000000201',
    );
  });

  it('inscricao aberta em destaque, atividades com a inscricao e vigencia decorrida', async () => {
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: NUCLEO }));
    renderView();

    const destaque = within(await screen.findByRole('region', { name: /Inscrições abertas/ }));
    expect(
      destaque.getByRole('heading', { name: 'Inscrições abertas · 1 de 2' }),
    ).toBeInTheDocument();
    expect(destaque.getByText('Oficina de serigrafia')).toBeInTheDocument();
    expect(destaque.getByText('12 de 30 vagas preenchidas')).toBeInTheDocument();
    expect(destaque.getByRole('link', { name: /Abrir formulário/ })).toHaveAttribute(
      'href',
      `${window.location.origin}/inscrever/AbCdEfGhIjKlMnOp`,
    );

    const atividades = within(screen.getByRole('region', { name: 'Próximas atividades' }));
    expect(atividades.getAllByText('Inscrição aberta · 12 de 30').length).toBeGreaterThan(0);
    expect(atividades.getAllByText('Inscrição não aberta').length).toBeGreaterThan(0);

    expect(
      screen.getByRole('progressbar', { name: 'Vigência decorrida do processo DEMO-0001/2026' }),
    ).toHaveAttribute('aria-valuenow', '66');
    expect(screen.getByText('Faltam 123 dias')).toBeInTheDocument();
  });

  it('sem pendencias, cada bloco diz que esta em dia', async () => {
    const vazio: Dashboard = {
      ...NUCLEO,
      painel: {
        ...PANEL,
        resumo: {
          ...PANEL.resumo,
          metasVencendo: 0,
          metasVencidas: 0,
          metasSemResponsavel: 0,
          inscricoesAbertas: 0,
        },
        prazos: [],
        semResponsavel: [],
        proximasAtividades: [],
        inscricoesAbertas: [],
        vigencias: [],
      },
    };
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: vazio }));
    renderView();

    expect(await screen.findByText('Nenhuma pendência de prazo.')).toBeInTheDocument();
    expect(screen.getByText('Todas as metas têm responsável.')).toBeInTheDocument();
    expect(
      screen.getByText('Nenhuma atividade marcada para os próximos 30 dias.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhuma inscrição aberta. Abra pela lista de atividades, na página do projeto.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhuma meta vencida, com prazo nos próximos 30 dias ou sem responsável. Os prazos estão em dia.',
      ),
    ).toBeInTheDocument();
  });

  it('administracao ve o resumo das contas e a situacao do sistema', async () => {
    await signedInWith('ADMINISTRACAO_SISTEMA', () => ({
      status: 200,
      body: {
        usuario: { nome: 'Vinicius Vieira', perfil: 'ADMINISTRACAO_SISTEMA', setor: null },
        painel: null,
        contas: { ativas: 6, bloqueadas: 1, aguardandoPrimeiroAcesso: 2 },
      },
    }));
    renderView();

    expect(await screen.findByRole('heading', { name: 'Olá, Vinicius' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gerenciar contas' })).toHaveAttribute(
      'href',
      '/contas',
    );
    expect(screen.getByText('Aguardando o primeiro acesso')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Situação do sistema' })).toBeInTheDocument();
  });

  it('falha ao carregar mostra o aviso e tenta de novo', async () => {
    let calls = 0;
    await signedInWith('NUCLEO_PEDAGOGICO', () => {
      calls += 1;
      return calls === 1
        ? { status: 500, body: { code: 'INTERNAL_ERROR', message: 'Erro' } }
        : { status: 200, body: NUCLEO };
    });
    renderView();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o painel.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('heading', { name: 'Olá, Maria' })).toBeInTheDocument();
  });

  it('carrossel passa para a proxima inscricao e copia o link dela', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: NUCLEO }));
    renderView();

    const destaque = within(await screen.findByRole('region', { name: /Inscrições abertas/ }));
    fireEvent.click(destaque.getByRole('button', { name: 'Próxima inscrição' }));
    expect(destaque.getByText('Mostra de dança')).toBeInTheDocument();
    expect(
      destaque.getByRole('heading', { name: 'Inscrições abertas · 2 de 2' }),
    ).toBeInTheDocument();

    fireEvent.click(destaque.getByRole('button', { name: 'Copiar link' }));
    expect(await screen.findByText('Link copiado')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/inscrever/QrStUvWxYzAbCdEf`);
  });

  it('lista de prazos avisa quantas aparecem quando ha mais', async () => {
    const muitos: Dashboard = {
      ...NUCLEO,
      painel: { ...PANEL, resumo: { ...PANEL.resumo, metasVencidas: 7, metasVencendo: 4 } },
    };
    await signedInWith('NUCLEO_PEDAGOGICO', () => ({ status: 200, body: muitos }));
    renderView();

    expect(
      await screen.findByText('Vencidas e com prazo nos próximos 30 dias · 3 de 11'),
    ).toBeInTheDocument();
  });

  it('orgao concedente ve so as boas-vindas, e quem nao abre inscricao nao recebe a instrucao', async () => {
    await signedInWith('CONCEDENTE_AUDITORIA', () => ({
      status: 200,
      body: {
        usuario: { nome: 'Auditora Federal', perfil: 'CONCEDENTE_AUDITORIA', setor: null },
        painel: null,
        contas: null,
      },
    }));
    renderView();

    expect(await screen.findByRole('heading', { name: 'Olá, Auditora' })).toBeInTheDocument();
    expect(screen.getByText(/consulta à prestação de contas/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Prazos das metas' })).not.toBeInTheDocument();
  });

  it('financeiro sem inscricao aberta nao recebe a instrucao de abrir', async () => {
    const financeiro: Dashboard = {
      ...NUCLEO,
      usuario: { ...NUCLEO.usuario, perfil: 'ADMINISTRATIVO_FINANCEIRO' },
      painel: {
        ...PANEL,
        resumo: { ...PANEL.resumo, inscricoesAbertas: 0 },
        inscricoesAbertas: [],
      },
    };
    await signedInWith('ADMINISTRATIVO_FINANCEIRO', () => ({ status: 200, body: financeiro }));
    renderView();

    expect(await screen.findByText('Nenhuma inscrição aberta no momento.')).toBeInTheDocument();
  });

  it('resumo do dia sem metas vencidas fala so do prazo proximo', () => {
    expect(
      panelSummary({ ...PANEL, resumo: { ...PANEL.resumo, metasVencidas: 0, minhasMetas: 0 } }),
    ).toBe('Há 2 metas com prazo nos próximos 30 dias e 1 meta sem responsável.');
  });
});
