'use client';

import { Building2Icon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { PageHeader } from '@/components/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useDialogState } from '@/hooks/use-dialog-state';
import { ApiError } from '@/lib/api';
import { useSectors, useSetSectorActive } from '@/queries/setores';
import type { Sector } from '@/types/setores';
import { SectorFormDialog, failureOf } from '../sector-form-dialog';

const DESCRIPTION =
  'Coordenações e diretorias do Instituto: a lotação de cada pessoa e o setor executor de cada meta.';

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta setores.';
  }
  return 'Não foi possível carregar os setores. Tente de novo.';
}

function StatusBadge({ sector }: { sector: Sector }) {
  return (
    <Badge variant={sector.ativo ? 'secondary' : 'outline'}>
      {sector.ativo ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

export function SectorsView() {
  const { session } = useSession();
  const canEdit = session?.perfil === 'PRESIDENCIA_GESTAO';
  const sectors = useSectors();
  const pagination = usePagination(sectors.data);
  const form = useDialogState<{ sector: Sector | null }>();
  const deactivating = useDialogState<{ sector: Sector }>();
  const setActive = useSetSectorActive();
  const [deactivateFailure, setDeactivateFailure] = useState<string | null>(null);

  async function changeActive(sector: Sector, ativo: boolean) {
    await setActive.mutateAsync({ sector, ativo });
    toast.add({ type: 'success', title: ativo ? 'Setor reativado' : 'Setor desativado' });
  }

  async function reactivate(sector: Sector) {
    try {
      await changeActive(sector, true);
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Não foi possível reativar',
        description: failureOf(error),
      });
    }
  }

  async function confirmDeactivate() {
    if (!deactivating.value) return;
    setDeactivateFailure(null);
    try {
      await changeActive(deactivating.value.sector, false);
      deactivating.close();
    } catch (error) {
      setDeactivateFailure(failureOf(error));
    }
  }

  const createButton = canEdit && (
    <Button onClick={() => form.show({ sector: null })}>
      <PlusIcon data-icon="inline-start" />
      Novo setor
    </Button>
  );

  return (
    <>
      <PageHeader title="Setores" description={DESCRIPTION} action={createButton} />

      {sectors.error && !sectors.data ? (
        <ListError message={loadFailure(sectors.error)} />
      ) : sectors.data?.length === 0 ? (
        <ListEmpty
          icon={Building2Icon}
          title="Nenhum setor cadastrado"
          description="Cadastre as coordenações e diretorias do Instituto, como a Coordenação Pedagógica."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={sectors.isPending}>
            <TableCaption className="sr-only">{DESCRIPTION}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Setor
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
              {sectors.isPending ? (
                <TableSkeleton columns={canEdit ? 3 : 2} />
              ) : (
                pagination.pageRows.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{sector.nome}</span>
                        <span className="md:hidden">
                          <StatusBadge sector={sector} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge sector={sector} />
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações do setor ${sector.nome}`}
                          actions={[
                            { label: 'Editar setor', onSelect: () => form.show({ sector }) },
                            sector.ativo
                              ? {
                                  label: 'Desativar setor',
                                  onSelect: () => deactivating.show({ sector }),
                                }
                              : {
                                  label: 'Reativar setor',
                                  onSelect: () => void reactivate(sector),
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
          <ListPagination pagination={pagination} label="Paginação dos setores" />
        </ListCard>
      )}

      <SectorFormDialog
        open={form.open}
        sector={form.value?.sector ?? null}
        onClose={form.close}
        onSaved={() => toast.add({ type: 'success', title: 'Setor salvo' })}
      />

      <AlertDialog
        open={deactivating.open}
        onOpenChange={(next) => {
          if (next || setActive.isPending) return;
          setDeactivateFailure(null);
          deactivating.close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar setor</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivating.value?.sector.nome}: deixa de aparecer na escolha de setor; as pessoas e
              as metas que já estão nele continuam. Dá para reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deactivateFailure && (
            <p role="alert" className="text-sm text-destructive">
              {deactivateFailure}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={setActive.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={setActive.isPending}
              onClick={confirmDeactivate}
            >
              {setActive.isPending ? 'Aguarde…' : 'Desativar setor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
