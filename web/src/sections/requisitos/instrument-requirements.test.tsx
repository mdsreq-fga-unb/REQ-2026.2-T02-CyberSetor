import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument } from '@/types/instrumentos';
import type { Requirement } from '@/types/requisitos';
import { InstrumentRequirements } from './instrument-requirements';

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000101',
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

const FREQUENCIA: Requirement = {
  id: '00000000-0000-4000-8000-000000000701',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  descricao: 'Frequência mínima de 70% dos participantes',
  referencia: 'TR, item 24.1',
};

const CERTIFICADO: Requirement = {
  id: '00000000-0000-4000-8000-000000000702',
  versao: 1,
  instrumentoId: INSTRUMENT.id,
  descricao: 'Certificado para quem concluir a formação',
  referencia: null,
};

const LIST = `GET /instruments/${INSTRUMENT.id}/requirements`;
const CREATE = `POST /instruments/${INSTRUMENT.id}/requirements`;

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

function renderSection(canEdit: boolean) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <InstrumentRequirements instrument={INSTRUMENT} canEdit={canEdit} />
      </Toaster>
    </QueryClientProvider>,
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('requisitos do instrumento', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('lista os requisitos com a referencia, sem acoes para quem so consulta', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [LIST]: () => ({ status: 200, body: [FREQUENCIA, CERTIFICADO] }),
    });
    renderSection(false);

    await screen.findByText('Frequência mínima de 70% dos participantes');
    const table = screen.getByRole('table', {
      name: 'Requisitos do instrumento do processo 71000.057425/2025-03.',
    });
    expect(table).toHaveTextContent('TR, item 24.1');
    expect(table).toHaveTextContent('—');
    expect(screen.queryByRole('button', { name: 'Novo requisito' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ações do requisito' })).not.toBeInTheDocument();
  });

  it('cadastra o requisito pelo estado vazio', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [] }),
      [CREATE]: () => ({ status: 201, body: FREQUENCIA }),
    });
    renderSection(true);

    await screen.findByText('Nenhum requisito neste instrumento');
    fireEvent.click(screen.getByRole('button', { name: 'Novo requisito' }));
    fill('Requisito', '  Frequência mínima de 70% dos participantes ');
    fill('Referência (opcional)', 'TR, item 24.1');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar requisito' }));

    expect(await screen.findByText('Requisito salvo')).toBeInTheDocument();
    expect(calls.find((call) => call.key === CREATE)?.body).toEqual({
      descricao: 'Frequência mínima de 70% dos participantes',
      referencia: 'TR, item 24.1',
    });
  });

  it('requisito sem descricao nao chama a API', async () => {
    const calls = await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [FREQUENCIA] }),
    });
    renderSection(true);

    fireEvent.click(await screen.findByRole('button', { name: 'Novo requisito' }));
    fill('Referência (opcional)', 'TR, item 24.2');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar requisito' }));

    expect(await screen.findByText('Descreva o requisito.')).toBeInTheDocument();
    expect(calls.some((call) => call.key === CREATE)).toBe(false);
  });

  it('depois de um conflito, mostra a versao atual e salva com ela', async () => {
    const patches: unknown[] = [];
    const fresh = { ...FREQUENCIA, versao: 3, referencia: 'TR, item 24.1.a' };
    let lists = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: lists++ === 0 ? [FREQUENCIA] : [fresh] }),
      [`PATCH /requirements/${FREQUENCIA.id}`]: (body) => {
        patches.push(body);
        return patches.length === 1
          ? {
              status: 409,
              body: { code: 'VERSION_CONFLICT', message: 'O requisito foi alterado.' },
            }
          : { status: 200, body: { ...fresh, versao: 4 } };
      },
    });
    renderSection(true);

    fireEvent.click(await screen.findByRole('button', { name: 'Ações do requisito' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar requisito' }));
    fill('Requisito', 'Frequência mínima de 75%');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar requisito' }));

    expect(await screen.findByText(/Outra pessoa alterou este requisito/)).toBeInTheDocument();
    expect(screen.getByLabelText('Referência (opcional)')).toHaveValue('TR, item 24.1.a');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar requisito' }));

    expect(await screen.findByText('Requisito salvo')).toBeInTheDocument();
    expect(patches[1]).toMatchObject({ versao: 3, referencia: 'TR, item 24.1.a' });
  });

  it('recusa da API aparece no formulario', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [LIST]: () => ({ status: 200, body: [FREQUENCIA] }),
      [CREATE]: () => ({
        status: 409,
        body: {
          code: 'INSTRUMENT_INACTIVE',
          message: 'O instrumento está inativo e não recebe nem altera requisitos.',
        },
      }),
    });
    renderSection(true);

    fireEvent.click(await screen.findByRole('button', { name: 'Novo requisito' }));
    fill('Requisito', 'Relatório fotográfico');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar requisito' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O instrumento está inativo e não recebe nem altera requisitos.',
    );
  });
});
