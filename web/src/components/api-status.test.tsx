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

    expect(await screen.findByText('API conectada; banco disponivel')).toBeInTheDocument();
  });

  it('mostra a API indisponivel quando a saude falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'SERVICE_UNAVAILABLE', message: 'x' }), {
          status: 503,
        }),
      ),
    );

    renderWithQuery();

    expect(await screen.findByText('API indisponivel')).toBeInTheDocument();
  });
});
