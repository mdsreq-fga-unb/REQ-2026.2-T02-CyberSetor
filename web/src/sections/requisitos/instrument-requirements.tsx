'use client';

import { ListChecksIcon, PlusIcon } from 'lucide-react';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
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
import { useDialogState } from '@/hooks/use-dialog-state';
import { useRequirements } from '@/queries/requisitos';
import type { Instrument } from '@/types/instrumentos';
import type { Requirement } from '@/types/requisitos';
import { RequirementFormDialog } from './requirement-form-dialog';

export function InstrumentRequirements({
  instrument,
  canEdit,
}: {
  instrument: Instrument;
  canEdit: boolean;
}) {
  const requirements = useRequirements(instrument.id);
  const pagination = usePagination(requirements.data);
  const form = useDialogState<{ requirement: Requirement | null }>();

  const createButton = canEdit && (
    <Button variant="outline" onClick={() => form.show({ requirement: null })}>
      <PlusIcon data-icon="inline-start" />
      Novo requisito
    </Button>
  );

  return (
    <section className="flex flex-col gap-4" aria-labelledby="requisitos-titulo">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="requisitos-titulo" className="text-lg font-semibold">
          Requisitos do instrumento
        </h2>
        {requirements.data?.length !== 0 && createButton}
      </div>

      {requirements.error && !requirements.data ? (
        <ListError message="Não foi possível carregar os requisitos. Tente de novo." />
      ) : requirements.data?.length === 0 ? (
        <ListEmpty
          icon={ListChecksIcon}
          title="Nenhum requisito neste instrumento"
          description="Cadastre o que o instrumento exige, para ligar cada meta aos requisitos que ela atende."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={requirements.isPending}>
            <TableCaption className="sr-only">
              Requisitos do instrumento do processo {instrument.numeroProcesso}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Requisito
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Referência
                </TableHead>
                {canEdit && (
                  <TableHead scope="col" className="w-16 px-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.isPending ? (
                <TableSkeleton columns={canEdit ? 3 : 2} />
              ) : (
                pagination.pageRows.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span>{requirement.descricao}</span>
                        {requirement.referencia && (
                          <span className="text-muted-foreground md:hidden">
                            {requirement.referencia}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal md:table-cell">
                      {requirement.referencia ?? '—'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label="Ações do requisito"
                          actions={[
                            {
                              label: 'Editar requisito',
                              onSelect: () => form.show({ requirement }),
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
          <ListPagination pagination={pagination} label="Paginação dos requisitos" />
        </ListCard>
      )}

      <RequirementFormDialog
        open={form.open}
        instrument={instrument}
        requirement={form.value?.requirement ?? null}
        onClose={form.close}
        onSaved={() => toast.add({ type: 'success', title: 'Requisito salvo' })}
      />
    </section>
  );
}
