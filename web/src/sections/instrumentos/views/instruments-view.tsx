'use client';

import { FileTextIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { useInstruments } from '@/queries/instrumentos';
import type { Instrument, SavedInstrument } from '@/types/instrumentos';
import { INSTRUMENT_TYPES, formatDate, formatMoney } from '../format';
import { InstrumentFormDialog } from '../instrument-form-dialog';

const DESCRIPTION = 'Editais, emendas e parcerias que financiam os projetos do Instituto.';

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta instrumentos.';
  }
  return 'Não foi possível carregar os instrumentos. Tente de novo.';
}

function term(instrument: Instrument): string {
  return `${formatDate(instrument.vigenciaInicio)} a ${formatDate(instrument.vigenciaFim)}`;
}

function StatusBadge({ instrument }: { instrument: Instrument }) {
  return (
    <Badge variant={instrument.ativo ? 'secondary' : 'outline'}>
      {instrument.ativo ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

export function InstrumentsView() {
  const { session } = useSession();
  const canEdit = session?.perfil === 'PRESIDENCIA_GESTAO';
  const instruments = useInstruments();
  const pagination = usePagination(instruments.data);
  const [form, setForm] = useState<{ open: boolean; instrument: Instrument | null }>({
    open: false,
    instrument: null,
  });

  function saved({ instrumento, numeroProcessoRepetido }: SavedInstrument) {
    toast.add(
      numeroProcessoRepetido
        ? {
            type: 'warning',
            title: 'Instrumento salvo',
            description: `Outro instrumento já usa o processo ${instrumento.numeroProcesso}.`,
          }
        : { type: 'success', title: 'Instrumento salvo' },
    );
  }

  const createButton = canEdit && (
    <Button onClick={() => setForm({ open: true, instrument: null })}>
      <PlusIcon data-icon="inline-start" />
      Novo instrumento
    </Button>
  );

  return (
    <>
      <PageHeader title="Instrumentos" description={DESCRIPTION} action={createButton} />

      {instruments.error ? (
        <ListError message={loadFailure(instruments.error)} />
      ) : instruments.data?.length === 0 ? (
        <ListEmpty
          icon={FileTextIcon}
          title="Nenhum instrumento cadastrado"
          description="Cadastre o edital, a emenda ou a parceria que financia cada projeto."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={instruments.isPending}>
            <TableCaption className="sr-only">{DESCRIPTION}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Instrumento
                </TableHead>
                <TableHead scope="col" className="hidden px-4 text-right md:table-cell">
                  Valor global
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Vigência
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Situação
                </TableHead>
                {canEdit && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.isPending ? (
                <TableSkeleton columns={canEdit ? 5 : 4} />
              ) : (
                pagination.pageRows.map((instrument) => (
                  <TableRow key={instrument.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {INSTRUMENT_TYPES[instrument.tipo]} · {instrument.orgaoConcedente}
                        </span>
                        <span className="break-all text-muted-foreground">
                          Processo {instrument.numeroProcesso}
                        </span>
                        <span className="md:hidden">
                          {formatMoney(instrument.valorGlobal)} · {term(instrument)}
                        </span>
                        <span className="md:hidden">
                          <StatusBadge instrument={instrument} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 text-right tabular-nums md:table-cell">
                      {formatMoney(instrument.valorGlobal)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{term(instrument)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge instrument={instrument} />
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações do instrumento do processo ${instrument.numeroProcesso}`}
                          actions={[
                            {
                              label: 'Editar instrumento',
                              onSelect: () => setForm({ open: true, instrument }),
                            },
                          ]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação dos instrumentos" />
        </ListCard>
      )}

      <InstrumentFormDialog
        open={form.open}
        instrument={form.instrument}
        onClose={() => setForm((previous) => ({ ...previous, open: false }))}
        onSaved={saved}
      />
    </>
  );
}
