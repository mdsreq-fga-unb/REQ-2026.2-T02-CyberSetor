'use client';

import { useState } from 'react';
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
import type { Account } from '@/types/contas';
import { errorMessage } from './error-message';

export type AccountAction = 'reset' | 'deactivate';

const TEXT: Record<AccountAction, { title: string; body: string; confirm: string }> = {
  reset: {
    title: 'Redefinir senha',
    body: 'gera uma nova senha temporária e encerra os acessos abertos da pessoa.',
    confirm: 'Redefinir senha',
  },
  deactivate: {
    title: 'Desativar conta',
    body: 'deixa de entrar no sistema a partir da próxima ação; os registros dela continuam.',
    confirm: 'Desativar conta',
  },
};

export function ConfirmActionDialog({
  target,
  onConfirm,
  onClose,
}: {
  target: { account: Account; action: AccountAction } | null;
  onConfirm: (account: Account, action: AccountAction) => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const text = target ? TEXT[target.action] : TEXT.reset;

  function close() {
    setFailure(null);
    onClose();
  }

  async function confirm() {
    if (!target) return;
    setBusy(true);
    setFailure(null);
    try {
      await onConfirm(target.account, target.action);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={target !== null} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{text.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {target?.account.nome}: {text.body}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {failure && (
          <p role="alert" className="text-sm text-destructive">
            {failure}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={target?.action === 'deactivate' ? 'destructive' : 'default'}
            disabled={busy}
            onClick={confirm}
          >
            {busy ? 'Aguarde…' : text.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
