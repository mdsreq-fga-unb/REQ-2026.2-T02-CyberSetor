import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ApiStatus } from './api-status';

function renderWithQuery() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ApiStatus />
    </QueryClientProvider>,
  );
}

describe('ApiStatus', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('mostra a API conectada quando a saude responde ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ status: 'ok', banco: 'ok' }), { status: 200 }),
        ),
    );

    renderWithQuery();

    expect(await screen.findByText('API conectada; banco disponível')).toBeInTheDocument();
  });

  it('mostra o banco indisponivel quando a saude responde 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'SERVICE_UNAVAILABLE', message: 'x' }), {
          status: 503,
        }),
      ),
    );

    renderWithQuery();

    expect(await screen.findByText('API conectada; banco indisponível')).toBeInTheDocument();
  });

  it('mostra a API indisponivel quando a requisicao nao chega', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    renderWithQuery();

    expect(await screen.findByText('API indisponível')).toBeInTheDocument();
  });
});
