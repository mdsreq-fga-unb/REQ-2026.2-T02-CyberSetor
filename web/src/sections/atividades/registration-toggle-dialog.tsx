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
import { ApiError } from '@/lib/api';
import { useFreshRegistration, useUpdateRegistration } from '@/queries/inscricoes';
import type { Activity } from '@/types/atividades';

const TEXT = {
  close: {
    title: 'Encerrar inscrições',
    body: 'o link e o QR Code continuam no ar e passam a avisar que as inscrições foram encerradas. Quem já se inscreveu continua inscrito. Dá para reabrir depois.',
    confirm: 'Encerrar inscrições',
    done: 'Inscrições encerradas',
  },
  reopen: {
    title: 'Reabrir inscrições',
    body: 'o mesmo link e o mesmo QR Code voltam a receber inscrições.',
    confirm: 'Reabrir inscrições',
    done: 'Inscrições reabertas',
  },
} as const;

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 403) {
    return 'O seu perfil não tem permissão para alterar a inscrição desta atividade.';
  }
  if (error.status === 409 || error.status === 400) return error.message;
  return 'Não foi possível alterar a inscrição. Tente de novo.';
}

/** Encerra ou reabre a inscrição de uma atividade, confirmando o efeito antes (CA-07a.7, CA-07b.4). */
export function RegistrationToggleDialog({
  activity,
  onClose,
  onDone,
}: {
  activity: Activity | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const activityId = activity?.id ?? '';
  const freshRegistration = useFreshRegistration();
  const update = useUpdateRegistration(activityId);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const action = activity?.inscricao?.aberta === false ? 'reopen' : 'close';
  const text = TEXT[action];

  function close() {
    if (busy) return;
    setFailure(null);
    onClose();
  }

  async function confirm() {
    if (!activity) return;
    setBusy(true);
    setFailure(null);
    try {
      // A lista não traz a versão da configuração; a leitura imediata evita salvar sobre outra.
      const current = await freshRegistration(activity.id);
      await update.mutateAsync({ versao: current.versao, aberta: action === 'reopen' });
      onClose();
      onDone(text.done);
    } catch (error) {
      setFailure(failureOf(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={activity !== null} onOpenChange={(next) => !next && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{text.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {activity?.titulo}: {text.body}
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
            variant={action === 'close' ? 'destructive' : 'default'}
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
