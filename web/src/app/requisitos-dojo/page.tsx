'use client';

import { OutboxDojo } from '@/components/outbox-dojo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCriarRequisitoDojo,
  useRequisitosDojo,
} from '@/hooks/use-requisitos-dojo';

export default function RequisitosDojoPage() {
  const requisitos = useRequisitosDojo();
  const criar = useCriarRequisitoDojo();

  if (requisitos.isPending) return <p>Carregando…</p>;
  if (requisitos.isError) return <p>Falha: {requisitos.error.message}</p>;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Requisitos do dojo</h1>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          criar.mutate({
            origem: String(form.get('origem')),
            indicador: 'indicador didático',
            parametroAfericao: 'parâmetro didático',
            formaVerificacao: 'verificação didática',
            frequenciaApuracao: 'frequência didática',
          });
        }}
      >
        <Input name="origem" aria-label="Origem" />
        <Button type="submit" disabled={criar.isPending}>Criar</Button>
      </form>

      {criar.isError && <p>Falha ao criar: {criar.error.message}</p>}

      <ul className="list-disc pl-6">
        {requisitos.data.map((item) => (
          <li key={item.id}>{item.origem}</li>
        ))}
      </ul>

      <OutboxDojo />
    </main>
  );
}
