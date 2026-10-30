import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, signIn } from '@/auth/session';
import type { Activity } from '@/types/atividades';
import type { Registration } from '@/types/inscricoes';
import { RegistrationShareDialog } from './registration-share-dialog';

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
  data: '2026-05-10',
  horaInicio: null,
  horaFim: null,
  cargaHorariaMinutos: null,
  local: 'Galpão SCS',
  inscricao: null,
  metas: [{ id: '00000000-0000-4000-8000-000000000051', ordem: 1, objetivo: 'Atender 100 jovens' }],
};

const REGISTRATION_OPEN: Registration = {
  atividadeId: ACTIVITY.id,
  versao: 1,
  aberta: true,
  vagas: 30,
  camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  camposAdicionais: ['CPF', 'EMAIL'],
  campoDuplicidade: 'CPF',
  codigoPublico: 'xyz987654321',
  linkPublico: '/inscrever/xyz987654321',
};

const REGISTRATION_CLOSED: Registration = {
  ...REGISTRATION_OPEN,
  aberta: false,
};

type Route = (body: unknown) => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      if (key === 'POST /auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route(undefined);
      return json(result.status, result.body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
}

function renderShareDialog({
  activity = ACTIVITY,
  initialRegistration,
  onClose = vi.fn(),
  onOpenConfigure,
}: {
  activity?: Activity | null;
  initialRegistration?: Registration | null;
  onClose?: () => void;
  onOpenConfigure?: () => void;
} = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RegistrationShareDialog
        open={true}
        activity={activity}
        initialRegistration={initialRegistration}
        onClose={onClose}
        onOpenConfigure={onOpenConfigure}
      />
    </QueryClientProvider>,
  );
}

describe('RegistrationShareDialog', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('exibe o link publico, gera QR Code e permite copiar link', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: REGISTRATION_OPEN,
      }),
    });

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    renderShareDialog();

    expect(
      await screen.findByRole('heading', { name: 'Divulgar inscrição da atividade' }),
    ).toBeInTheDocument();

    const linkInput = (await screen.findByLabelText(
      'Link público do formulário',
    )) as HTMLInputElement;
    expect(linkInput.value).toContain('/inscrever/xyz987654321');

    // QR Code renderizado
    expect(await screen.findByAltText(/QR Code para inscrição/)).toBeInTheDocument();

    // Copiar link
    const copyButton = await screen.findByRole('button', { name: /Copiar link/ });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(linkInput.value);
      expect(screen.getByText('Copiado!')).toBeInTheDocument();
    });
  });

  it('exibe aviso visual quando a inscricao esta encerrada', async () => {
    renderShareDialog({ initialRegistration: REGISTRATION_CLOSED });

    expect(
      await screen.findByRole('heading', { name: 'Divulgar inscrição da atividade' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/As inscrições estão encerradas/)).toBeInTheDocument();
    expect(screen.getByText('Encerrada')).toBeInTheDocument();
  });

  it('dispara o download do QR Code ao clicar em Baixar QR Code PNG', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 200,
        body: REGISTRATION_OPEN,
      }),
    });

    const clickSpy = vi.fn();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreate(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    renderShareDialog();

    expect(await screen.findByAltText(/QR Code para inscrição/)).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /Baixar QR Code PNG/ });
    expect(downloadBtn).not.toBeDisabled();
    fireEvent.click(downloadBtn);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('informa a falha ao carregar a inscricao e tenta de novo, sem dizer que ela nao foi aberta', async () => {
    let calls = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => {
        calls += 1;
        // a consulta tenta três vezes antes de mostrar a falha
        return calls <= 3
          ? { status: 500, body: { code: 'INTERNAL_ERROR' } }
          : { status: 200, body: REGISTRATION_OPEN };
      },
    });

    renderShareDialog();

    expect(
      await screen.findByText(
        'Não foi possível carregar a inscrição. Tente de novo.',
        {},
        { timeout: 6000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('A inscrição desta atividade ainda não foi aberta.'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByLabelText('Link público do formulário')).toBeInTheDocument();
  }, 10_000);

  it('informa quando a atividade ainda nao tem inscricao aberta', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET /activities/${ACTIVITY.id}/registration`]: () => ({
        status: 404,
        body: { code: 'REGISTRATION_NOT_OPENED' },
      }),
    });

    const onOpenConfigure = vi.fn();
    renderShareDialog({ onOpenConfigure });

    expect(
      await screen.findByText('A inscrição desta atividade ainda não foi aberta.'),
    ).toBeInTheDocument();

    const configButton = screen.getByRole('button', { name: 'Configurar inscrição agora' });
    fireEvent.click(configButton);
    expect(onOpenConfigure).toHaveBeenCalledTimes(1);
  });
});
