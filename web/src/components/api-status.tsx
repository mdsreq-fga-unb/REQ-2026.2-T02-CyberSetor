'use client';

import { useQuery } from '@tanstack/react-query';
import { API_URL, getHealth } from '@/lib/api';

export function ApiStatus() {
  const { data, isPending, isError } = useQuery({ queryKey: ['health'], queryFn: getHealth });

  const text = isPending
    ? 'Verificando a API...'
    : isError
      ? 'API indisponivel'
      : `API conectada; banco ${data.banco === 'ok' ? 'disponivel' : 'indisponivel'}`;

  return (
    <section aria-label="Situacao da API" className="rounded-lg border p-4">
      <p role="status" className="font-medium">
        {text}
      </p>
      <p className="text-sm text-muted-foreground">{API_URL}</p>
    </section>
  );
}
