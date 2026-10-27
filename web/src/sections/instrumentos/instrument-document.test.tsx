import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clearLocalSession, signIn } from '@/auth/session';
import { Toaster } from '@/components/ui/toast';
import type { Instrument, InstrumentDocument as Document } from '@/types/instrumentos';
import { InstrumentDocument } from './instrument-document';

const INSTRUMENT: Instrument = {
  id: '00000000-0000-4000-8000-000000000101',
  versao: 1,
  tipo: 'EMENDA',
  orgaoConcedente: 'Secretaria de Cultura',
  numeroProcesso: '00150-1/2026',
  valorGlobal: '150000.50',
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
  ativo: true,
  documentoFormalEm: null,
};

const PATH = `/instruments/${INSTRUMENT.id}/document`;

const TERMO: Document = {
  nomeArquivo: 'Termo de Fomento 12-2026.pdf',
  tipoConteudo: 'application/pdf',
  tamanho: 1_572_864,
  sha256: 'a'.repeat(64),
  enviadoEm: '2026-10-27T13:05:00.000Z',
  enviadoPor: { id: '00000000-0000-4000-8000-000000000201', nome: 'Beatriz Gestão' },
  url: 'https://anexos.example/termo.pdf?assinatura=1',
  expiraEm: '2026-10-27T13:10:00.000Z',
};

type Route = () => { status: number; body?: unknown };

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

async function signedInAs(perfil: string, routes: Record<string, Route>) {
  const sent: FormData[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const key = `${init.method ?? 'GET'} ${new URL(url).pathname.replace(/^\/v1/, '')}`;
      if (key === 'POST /auth/login') {
        return json(200, { accessToken: 't', perfil, deveTrocarSenha: false });
      }
      if (init.body instanceof FormData) sent.push(init.body);
      const route = routes[key];
      if (!route) return json(404, { code: 'NOT_FOUND', message: key });
      const result = route();
      return json(result.status, result.body);
    }),
  );
  await signIn('gestao@instituto.org.br', 'senha-de-teste-longa');
  return sent;
}

function renderSection(canEdit: boolean) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Toaster>
        <InstrumentDocument instrument={INSTRUMENT} canEdit={canEdit} />
      </Toaster>
    </QueryClientProvider>,
  );
}

function choose(file: File) {
  fireEvent.change(screen.getByLabelText('Arquivo do documento formal'), {
    target: { files: [file] },
  });
}

describe('documento formal do instrumento', () => {
  afterEach(() => {
    cleanup();
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('mostra o documento anexado, com o link para abrir', async () => {
    await signedInAs('NUCLEO_PEDAGOGICO', {
      [`GET ${PATH}`]: () => ({ status: 200, body: TERMO }),
    });
    renderSection(false);

    expect(await screen.findByText('Termo de Fomento 12-2026.pdf')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Documento formal' })).toHaveAccessibleDescription(
      /Termo, convênio ou ato assinado com o concedente\. Documentos internos/,
    );
    expect(
      screen.getByText(/PDF · 1,5 MB · enviado em 27\/10\/2026, 10:05 por Beatriz Gestão/),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Abrir documento' });
    expect(link).toHaveAttribute('href', TERMO.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('button', { name: /documento/ })).not.toBeInTheDocument();
  });

  it('sem documento, indica o envio e anexa o PDF escolhido', async () => {
    let attached = false;
    const sent = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET ${PATH}`]: () =>
        attached
          ? { status: 200, body: TERMO }
          : { status: 404, body: { code: 'DOCUMENT_NOT_ATTACHED' } },
      [`PUT ${PATH}`]: () => {
        attached = true;
        return { status: 200, body: TERMO };
      },
    });
    renderSection(true);

    expect(await screen.findByText('Nenhum documento formal anexado')).toBeInTheDocument();
    choose(new File(['%PDF-1.7'], 'termo.pdf', { type: 'application/pdf' }));

    expect(await screen.findByText('Documento formal anexado')).toBeInTheDocument();
    expect(sent).toHaveLength(1);
    expect((sent[0].get('arquivo') as File).name).toBe('termo.pdf');
    expect(await screen.findByRole('button', { name: 'Substituir documento' })).toBeInTheDocument();
  });

  it('recusa na tela o arquivo que nao e PDF nem DOCX ou passa de 20 MB, sem enviar', async () => {
    const sent = await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET ${PATH}`]: () => ({ status: 404, body: { code: 'DOCUMENT_NOT_ATTACHED' } }),
    });
    renderSection(true);
    await screen.findByText('Nenhum documento formal anexado');

    choose(new File(['x'], 'termo.odt'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O documento formal precisa ser PDF ou DOCX.',
    );

    const big = new File(['x'], 'termo.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 20 * 1024 * 1024 + 1 });
    choose(big);
    expect(await screen.findByRole('alert')).toHaveTextContent('O arquivo passa de 20 MB.');
    expect(sent).toHaveLength(0);
  });

  it('mostra a recusa da API pelo conteudo do arquivo', async () => {
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET ${PATH}`]: () => ({ status: 404, body: { code: 'DOCUMENT_NOT_ATTACHED' } }),
      [`PUT ${PATH}`]: () => ({
        status: 415,
        body: {
          code: 'INVALID_DOCUMENT_TYPE',
          message: 'O documento formal precisa ser PDF ou DOCX.',
        },
      }),
    });
    renderSection(true);
    await screen.findByText('Nenhum documento formal anexado');

    choose(new File(['nao sou pdf'], 'termo.pdf', { type: 'application/pdf' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O documento formal precisa ser PDF ou DOCX.',
    );
  });

  it('na falha ao carregar, avisa e tenta de novo', async () => {
    let calls = 0;
    await signedInAs('PRESIDENCIA_GESTAO', {
      [`GET ${PATH}`]: () => {
        calls += 1;
        return calls === 1
          ? { status: 500, body: { code: 'INTERNAL_ERROR' } }
          : { status: 200, body: TERMO };
      },
    });
    renderSection(true);

    expect(
      await screen.findByText('Não foi possível carregar o documento formal. Tente de novo.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Nenhum documento formal anexado')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    await waitFor(() =>
      expect(screen.getByText('Termo de Fomento 12-2026.pdf')).toBeInTheDocument(),
    );
  });
});
