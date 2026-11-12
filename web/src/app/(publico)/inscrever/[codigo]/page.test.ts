import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './page';

const apiRequest = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiRequest }));

const params = Promise.resolve({ codigo: 'abc123xyz789' });

describe('previa do link de inscricao', () => {
  afterEach(() => apiRequest.mockReset());

  it('leva titulo e descricao ao Open Graph e ao Twitter Card, sem indexacao', async () => {
    apiRequest.mockResolvedValue({
      aberta: true,
      atividade: {
        titulo: 'Oficina de serigrafia',
        data: '2026-11-10',
        local: 'Setor Comercial Sul',
      },
    });

    const metadata = await generateMetadata({ params });

    const title = 'Inscrição: Oficina de serigrafia | Instituto No Setor';
    const description = '10/11/2026 · Setor Comercial Sul. Inscrições abertas.';
    expect(metadata).toMatchObject({
      title,
      description,
      robots: { index: false, follow: false },
      openGraph: { title, description },
      twitter: { card: 'summary', title, description },
    });
  });

  it('com o link invalido, fica so o titulo generico', async () => {
    apiRequest.mockRejectedValue(new Error('404'));

    const metadata = await generateMetadata({ params });

    expect(metadata).toEqual({
      robots: { index: false, follow: false },
      title: 'Inscrição | Instituto No Setor',
    });
  });
});
