'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/auth/hooks/use-session';
import { profileLabel } from '@/auth/profiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [notice, setNotice] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Contas</h1>
        <p className="text-muted-foreground">Só a administração do sistema gerencia contas.</p>
      </div>
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
    setNotice(
      projetosCoordenados > 0
        ? `Conta de ${account.nome} desativada. Ela coordena ${projetosCoordenados} ${
            projetosCoordenados === 1 ? 'projeto' : 'projetos'
          }: reatribua a coordenação.`
        : `Conta de ${account.nome} desativada.`,
    );
  }

  async function reactivateAccount(account: Account) {
    setNotice(null);
    try {
      await reactivate.mutateAsync(account.id);
      setNotice(`Conta de ${account.nome} reativada.`);
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Contas</h1>
          <p className="text-muted-foreground">
            Contas da equipe do Instituto e o perfil de acesso de cada pessoa.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon data-icon="inline-start" />
          Nova conta
        </Button>
      </div>

      <p role="status" className="min-h-5 text-sm">
        {notice ?? ''}
      </p>

      {accounts.isPending ? (
        <div aria-label="Carregando contas" className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : accounts.error ? (
        <p role="alert" className="text-destructive">
          {errorMessage(accounts.error)}
        </p>
      ) : (
        <ul aria-label="Contas" className="flex flex-col gap-3">
          {accounts.data.map((account) => (
            <li key={account.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{account.nome}</p>
                <p className="text-sm break-all text-muted-foreground">{account.emailLogin}</p>
                <p className="text-sm">{profileLabel(account.perfil)}</p>
                <div className="flex flex-wrap gap-2">
                  {statusTags(account).map((tag) => (
                    <Badge key={tag.label} variant={tag.tone}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {account.ativo ? (
                  <>
                    <Button
                      variant="outline"
                      aria-label={`Mudar perfil de ${account.nome}`}
                      onClick={() => setEditing(account)}
                    >
                      Mudar perfil
                    </Button>
                    <Button
                      variant="outline"
                      aria-label={`Redefinir senha de ${account.nome}`}
                      onClick={() => setConfirming({ account, action: 'reset' })}
                    >
                      Redefinir senha
                    </Button>
                    <Button
                      variant="outline"
                      aria-label={`Desativar conta de ${account.nome}`}
                      onClick={() => setConfirming({ account, action: 'deactivate' })}
                    >
                      Desativar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    aria-label={`Reativar conta de ${account.nome}`}
                    disabled={reactivate.isPending}
                    onClick={() => reactivateAccount(account)}
                  >
                    Reativar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateAccountDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(result) => setPassword({ title: 'Conta criada', result })}
      />
      <ChangeProfileDialog account={editing} onClose={() => setEditing(null)} />
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
