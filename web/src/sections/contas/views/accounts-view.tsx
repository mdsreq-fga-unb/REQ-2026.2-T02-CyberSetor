'use client';

import { PlusIcon, UsersIcon } from 'lucide-react';
import { cn } from 'cn';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { profileLabel } from '@/auth/profiles';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
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
import { AccountActionsMenu } from '../account-actions-menu';
import { statusTags } from '../account-status';
import { ChangeProfileDialog } from '../change-profile-dialog';
import { ConfirmActionDialog, type AccountAction } from '../confirm-action-dialog';
import { CreateAccountDialog } from '../create-account-dialog';
import { errorMessage } from '../error-message';
import { TemporaryPasswordDialog } from '../temporary-password-dialog';

const TITLE = 'Contas';

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
const DESCRIPTION = 'Contas da equipe do Instituto e o perfil de acesso de cada pessoa.';

export function AccountsView() {
  const { session } = useSession();
  const isAdmin = session?.perfil === 'ADMINISTRACAO_SISTEMA';
  const accounts = useAccounts(isAdmin);
  const deactivate = useDeactivateAccount();
  const reactivate = useReactivateAccount();
  const resetPassword = useResetPassword();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [confirming, setConfirming] = useState<{
    account: Account;
    action: AccountAction;
  } | null>(null);
  const [password, setPassword] = useState<{
    title: string;
    result: TemporaryPasswordResult;
  } | null>(null);

  if (!isAdmin) {
    return (
      <PageHeader title={TITLE} description="Só a administração do sistema gerencia contas." />
    );
  }

  async function confirmAction(account: Account, action: AccountAction) {
    if (action === 'reset') {
      const result = await resetPassword.mutateAsync(account.id);
      setConfirming(null);
      setPassword({ title: 'Senha redefinida', result });
      return;
    }
    const { projetosCoordenados } = await deactivate.mutateAsync(account.id);
    setConfirming(null);
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
      toast.add({ type: 'error', title: errorMessage(error) });
    }
  }

  return (
    <>
      <PageHeader
        title={TITLE}
        description={DESCRIPTION}
        action={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" />
            Nova conta
          </Button>
        }
      />

      {accounts.isPending ? (
        <div aria-label="Carregando contas" className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : accounts.error ? (
        <p role="alert" className="text-destructive">
          {errorMessage(accounts.error)}
        </p>
      ) : accounts.data.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma conta</EmptyTitle>
            <EmptyDescription>Crie a conta de cada pessoa da equipe.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
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
              {accounts.data.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="px-4 py-3 whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{account.nome}</span>
                      <span className="break-all text-muted-foreground">{account.emailLogin}</span>
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
                    <AccountActionsMenu
                      account={account}
                      onChangeProfile={() => setEditing(account)}
                      onResetPassword={() => setConfirming({ account, action: 'reset' })}
                      onDeactivate={() => setConfirming({ account, action: 'deactivate' })}
                      onReactivate={() => reactivateAccount(account)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateAccountDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(result) => setPassword({ title: 'Conta criada', result })}
      />
      <ChangeProfileDialog
        account={editing}
        onClose={() => setEditing(null)}
        onChanged={(account) =>
          toast.add({
            type: 'success',
            title: `Perfil de ${account.nome} alterado`,
            description: 'Vale a partir da próxima ação da pessoa.',
          })
        }
      />
      <ConfirmActionDialog
        target={confirming}
        onConfirm={confirmAction}
        onClose={() => setConfirming(null)}
      />
      <TemporaryPasswordDialog
        result={password?.result ?? null}
        title={password?.title ?? ''}
        onClose={() => setPassword(null)}
      />
    </>
  );
}
