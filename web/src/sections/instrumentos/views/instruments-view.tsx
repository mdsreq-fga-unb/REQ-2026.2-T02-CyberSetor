'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { useInstruments } from '@/queries/instrumentos';
import type { Instrument, SavedInstrument } from '@/types/instrumentos';
import { INSTRUMENT_TYPES, formatDate, formatMoney } from '../format';
import { InstrumentFormDialog } from '../instrument-form-dialog';

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta instrumentos.';
  }
  return 'Não foi possível carregar os instrumentos. Tente de novo.';
}

export function InstrumentsView() {
  const { session } = useSession();
  const canEdit = session?.perfil === 'PRESIDENCIA_GESTAO';
  const instruments = useInstruments();
  const [form, setForm] = useState<{ instrument: Instrument | null } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function saved({ instrumento, numeroProcessoRepetido }: SavedInstrument) {
    setNotice(
      numeroProcessoRepetido
        ? `Instrumento salvo. Atenção: outro instrumento já usa o processo ${instrumento.numeroProcesso}.`
        : 'Instrumento salvo.',
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Instrumentos</h1>
          <p className="text-muted-foreground">
            Editais, emendas e parcerias que financiam os projetos do Instituto.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setNotice(null);
              setForm({ instrument: null });
            }}
          >
            <PlusIcon data-icon="inline-start" />
            Novo instrumento
          </Button>
        )}
      </div>

      <p role="status" className="min-h-5 text-sm">
        {notice ?? ''}
      </p>

      {instruments.isPending ? (
        <div aria-label="Carregando instrumentos" className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : instruments.error ? (
        <p role="alert" className="text-destructive">
          {loadFailure(instruments.error)}
        </p>
      ) : instruments.data.length === 0 ? (
        <p className="text-muted-foreground">Nenhum instrumento cadastrado.</p>
      ) : (
        <ul aria-label="Instrumentos" className="flex flex-col gap-3">
          {instruments.data.map((instrument) => (
            <li key={instrument.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {INSTRUMENT_TYPES[instrument.tipo]} · {instrument.orgaoConcedente}
                </p>
                <p className="text-sm break-all text-muted-foreground">
                  Processo {instrument.numeroProcesso}
                </p>
                <p className="text-sm">
                  {formatMoney(instrument.valorGlobal)} · vigência de{' '}
                  {formatDate(instrument.vigenciaInicio)} a {formatDate(instrument.vigenciaFim)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={instrument.ativo ? 'secondary' : 'outline'}>
                    {instrument.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    aria-label={`Editar instrumento do processo ${instrument.numeroProcesso}`}
                    onClick={() => {
                      setNotice(null);
                      setForm({ instrument });
                    }}
                  >
                    Editar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <InstrumentFormDialog
        open={form !== null}
        instrument={form?.instrument ?? null}
        onClose={() => setForm(null)}
        onSaved={saved}
      />
    </>
  );
}
