'use client';

import { useQuery } from '@tanstack/react-query';
import { API_URL, ApiError, getHealth } from '@/lib/api';

export function ApiStatus() {
  const { isPending, error } = useQuery({ queryKey: ['health'], queryFn: getHealth });

  const text = isPending
    ? 'Verificando a API...'
    : error instanceof ApiError && error.status === 503
      ? 'API conectada; banco indisponível'
      : error
        ? 'API indisponível'
        : 'API conectada; banco disponível';

  return (
    <section aria-label="Situação da API" className="rounded-lg border p-4">
      <p role="status" className="font-medium">
        {text}
      </p>
      <p className="text-sm text-muted-foreground">{API_URL}</p>
    </section>
  );
}
