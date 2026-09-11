'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function OutboxDojo() {
  const pendentes = useLiveQuery(
    () => db.outbox.where('estado').equals('pendente').toArray(),
    [],
    [],
  );

  async function adicionar() {
    await db.outbox.add({
      clientMutationId: crypto.randomUUID(),
      payload: JSON.stringify({ exemplo: true }),
      estado: 'pendente',
      criadoEm: Date.now(),
    });
  }

  async function marcarPrimeiroComoEnviado() {
    const primeiro = pendentes[0];
    if (primeiro?.id !== undefined) {
      await db.outbox.update(primeiro.id, { estado: 'enviado' });
    }
  }

  return (
    <section className="space-y-2 rounded-md border p-4">
      <p>Pendentes: {pendentes.length}</p>
      <div className="flex gap-2">
        <button onClick={adicionar}>Adicionar</button>
        <button onClick={marcarPrimeiroComoEnviado}>Marcar enviado</button>
      </div>
    </section>
  );
}
