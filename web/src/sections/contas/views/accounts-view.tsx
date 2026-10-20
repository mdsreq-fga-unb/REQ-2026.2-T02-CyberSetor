'use client';

import { PlusIcon, UsersIcon } from 'lucide-react';
import { cn } from 'cn';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { profileLabel } from '@/auth/profiles';
import { ListPagination } from '@/components/list/list-pagination';
import { ListCard, ListEmpty, ListError, TableSkeleton } from '@/components/list/list-states';
import { RowActionsMenu, type RowAction } from '@/components/list/row-actions-menu';
import { usePagination } from '@/components/list/use-pagination';
import { useDialogState } from '@/hooks/use-dialog-state';
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
import {
  useAccounts,
  useDeactivateAccount,
  useReactivateAccount,
  useResetPassword,
} from '@/queries/contas';
import type { Account, TemporaryPasswordResult } from '@/types/contas';
import { statusTags } from '../account-status';
import { ChangeProfileDialog } from '../change-profile-dialog';
import { ConfirmActionDialog, type AccountAction } from '../confirm-action-dialog';
import { CreateAccountDialog } from '../create-account-dialog';
import { errorMessage } from '../error-message';
import { TemporaryPasswordDialog } from '../temporary-password-dialog';

const TITLE = 'Contas';
const DESCRIPTION = 'Contas da equipe do Instituto e o perfil de acesso de cada pessoa.';
const COLUMNS = 4;

function StatusTags({ account, className }: { account: Account; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {statusTags(account).map((tag) => (
        <Badge key={tag.label} variant={tag.tone}>
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}

export function AccountsView() {
  const { session } = useSession();
  const isAdmin = session?.perfil === 'ADMINISTRACAO_SISTEMA';
  const accounts = useAccounts(isAdmin);
  const pagination = usePagination(accounts.data);
  const deactivate = useDeactivateAccount();
  const reactivate = useReactivateAccount();
  const resetPassword = useResetPassword();

  const [creating, setCreating] = useState(false);
  const editing = useDialogState<Account>();
  const confirming = useDialogState<{ account: Account; action: AccountAction }>();
  const password = useDialogState<{ title: string; result: TemporaryPasswordResult }>();

  if (!isAdmin) {
    return (
      <PageHeader title={TITLE} description="Só a administração do sistema gerencia contas." />
    );
  }

  async function confirmAction(account: Account, action: AccountAction) {
    if (action === 'reset') {
      const result = await resetPassword.mutateAsync(account.id);
      confirming.close();
      password.show({ title: 'Senha redefinida', result });
      return;
    }
    const { projetosCoordenados } = await deactivate.mutateAsync(account.id);
    confirming.close();
    toast.add({
      type: 'success',
      title: `Conta de ${account.nome} desativada`,
      description:
        projetosCoordenados > 0
          ? `Ela coordena ${projetosCoordenados} ${
              projetosCoordenados === 1 ? 'projeto' : 'projetos'
            }: reatribua a coordenação.`
          : undefined,
    });
  }

  async function reactivateAccount(account: Account) {
    try {
      await reactivate.mutateAsync(account.id);
      toast.add({ type: 'success', title: `Conta de ${account.nome} reativada` });
    } catch (error) {
      toast.add({ type: 'error', priority: 'high', title: errorMessage(error) });
    }
  }

  function actionsFor(account: Account): RowAction[] {
    if (!account.ativo) {
      return [{ label: 'Reativar conta', onSelect: () => reactivateAccount(account) }];
    }
    return [
      { label: 'Mudar perfil', onSelect: () => editing.show(account) },
      { label: 'Redefinir senha', onSelect: () => confirming.show({ account, action: 'reset' }) },
      {
        label: 'Desativar conta',
        destructive: true,
        onSelect: () => confirming.show({ account, action: 'deactivate' }),
      },
    ];
  }

  const createButton = (
    <Button onClick={() => setCreating(true)}>
      <PlusIcon data-icon="inline-start" />
      Nova conta
    </Button>
  );

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} action={createButton} />

      {accounts.error && !accounts.data ? (
        <ListError message={errorMessage(accounts.error)} />
      ) : accounts.data?.length === 0 ? (
        <ListEmpty
          icon={UsersIcon}
          title="Nenhuma conta"
          description="Crie a conta de cada pessoa da equipe."
          action={createButton}
        />
      ) : (
        <ListCard>
          <Table aria-busy={accounts.isPending}>
            <TableCaption className="sr-only">{DESCRIPTION}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Pessoa
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Perfil
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Situação
                </TableHead>
                <TableHead scope="col" className="w-16 px-4">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.isPending ? (
                <TableSkeleton columns={COLUMNS} />
              ) : (
                pagination.pageRows.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{account.nome}</span>
                        <span className="break-all text-muted-foreground">
                          {account.emailLogin}
                        </span>
                        <span className="md:hidden">{profileLabel(account.perfil)}</span>
                        <StatusTags account={account} className="md:hidden" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {profileLabel(account.perfil)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StatusTags account={account} />
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <RowActionsMenu
                        label={`Ações de ${account.nome}`}
                        actions={actionsFor(account)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination pagination={pagination} label="Paginação das contas" />
        </ListCard>
      )}

      <CreateAccountDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(result) => password.show({ title: 'Conta criada', result })}
      />
      <ChangeProfileDialog
        open={editing.open}
        account={editing.value}
        onClose={editing.close}
        onChanged={(account) =>
          toast.add({
            type: 'success',
            title: `Perfil de ${account.nome} alterado`,
            description: 'Vale a partir da próxima ação da pessoa.',
          })
        }
      />
      <ConfirmActionDialog
        open={confirming.open}
        target={confirming.value}
        onConfirm={confirmAction}
        onClose={confirming.close}
      />
      <TemporaryPasswordDialog
        open={password.open}
        result={password.value?.result ?? null}
        title={password.value?.title ?? ''}
        onClose={password.close}
      />
    </>
  );
}
