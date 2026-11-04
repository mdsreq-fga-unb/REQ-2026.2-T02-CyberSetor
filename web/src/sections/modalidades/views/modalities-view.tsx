'use client';

import { PlusIcon, ShapesIcon } from 'lucide-react';
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
import { useModalities, useSetModalityActive } from '@/queries/modalidades';
import type { Modality } from '@/types/modalidades';
import { ModalityFormDialog, failureOf } from '../modality-form-dialog';

const DESCRIPTION =
  'Tipos de atividade que o Instituto realiza, usados no cadastro das atividades.';
const EDITORS = ['NUCLEO_PEDAGOGICO', 'PRESIDENCIA_GESTAO'];

function loadFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'O seu perfil não consulta modalidades.';
  }
  return 'Não foi possível carregar as modalidades. Tente de novo.';
}

function StatusBadge({ modality }: { modality: Modality }) {
  return (
    <Badge variant={modality.ativo ? 'secondary' : 'outline'}>
      {modality.ativo ? 'Ativa' : 'Inativa'}
    </Badge>
  );
}

export function ModalitiesView() {
  const { session } = useSession();
  const canEdit = session ? EDITORS.includes(session.perfil) : false;
  const modalities = useModalities();
  const pagination = usePagination(modalities.data);
  const form = useDialogState<{ modality: Modality | null }>();
  const deactivating = useDialogState<{ modality: Modality }>();
  const setActive = useSetModalityActive();
  const [deactivateFailure, setDeactivateFailure] = useState<string | null>(null);

  async function changeActive(modality: Modality, ativo: boolean) {
    await setActive.mutateAsync({ modality, ativo });
    toast.add({ type: 'success', title: ativo ? 'Modalidade reativada' : 'Modalidade desativada' });
  }

  async function reactivate(modality: Modality) {
    try {
      await changeActive(modality, true);
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
      await changeActive(deactivating.value.modality, false);
      deactivating.close();
    } catch (error) {
      setDeactivateFailure(failureOf(error));
    }
  }

  const createButton = canEdit && (
    <Button onClick={() => form.show({ modality: null })}>
      <PlusIcon data-icon="inline-start" />
      Nova modalidade
    </Button>
  );

  return (
    <>
      <PageHeader title="Modalidades" description={DESCRIPTION} action={createButton} />

      {modalities.error && !modalities.data ? (
        <ListError message={loadFailure(modalities.error)} />
      ) : modalities.data?.length === 0 ? (
        <ListEmpty
          icon={ShapesIcon}
          title="Nenhuma modalidade cadastrada"
          description="Cadastre os tipos de atividade do Instituto, como oficina contínua ou evento aberto."
          action={createButton || undefined}
        />
      ) : (
        <ListCard>
          <Table aria-busy={modalities.isPending}>
            <TableCaption className="sr-only">{DESCRIPTION}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Modalidade
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
              {modalities.isPending ? (
                <TableSkeleton columns={canEdit ? 3 : 2} />
              ) : (
                pagination.pageRows.map((modality) => (
                  <TableRow key={modality.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{modality.nome}</span>
                        {modality.descricao && (
                          <span className="text-muted-foreground">{modality.descricao}</span>
                        )}
                        <span className="md:hidden">
                          <StatusBadge modality={modality} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge modality={modality} />
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 text-right">
                        <RowActionsMenu
                          label={`Ações da modalidade ${modality.nome}`}
                          actions={[
                            { label: 'Editar modalidade', onSelect: () => form.show({ modality }) },
                            modality.ativo
                              ? {
                                  label: 'Desativar modalidade',
                                  onSelect: () => deactivating.show({ modality }),
                                }
                              : {
                                  label: 'Reativar modalidade',
                                  onSelect: () => void reactivate(modality),
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
          <ListPagination pagination={pagination} label="Paginação das modalidades" />
        </ListCard>
      )}

      <ModalityFormDialog
        open={form.open}
        modality={form.value?.modality ?? null}
        onClose={form.close}
        onSaved={() => toast.add({ type: 'success', title: 'Modalidade salva' })}
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
            <AlertDialogTitle>Desativar modalidade</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivating.value?.modality.nome}: deixa de aparecer para novas atividades; as
              atividades já cadastradas continuam com ela. Dá para reativar depois.
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
              {setActive.isPending ? 'Aguarde…' : 'Desativar modalidade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
