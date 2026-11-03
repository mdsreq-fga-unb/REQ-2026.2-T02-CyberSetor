'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DateField, TimeField } from '@/components/form/fields';
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
import { FieldGroup } from '@/components/ui/field';
import { ApiError } from '@/lib/api';
import { deadlinePassed, formatDeadline, todayInBrasilia } from '@/lib/br';
import { dateSchema, HH_MM } from '@/lib/schemas';
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

// Reabrir com o prazo vencido pede um prazo novo (CA-07d.7).
const deadlineSchema = z.object({
  prazoInscricao: dateSchema('Informe a data do prazo novo.', {
    notPast: 'O prazo novo não pode ser uma data que já passou.',
  }),
  prazoHora: z
    .string()
    .refine((value) => value === '' || HH_MM.test(value), 'Informe a hora, como 18:00.'),
});

type DeadlineValues = z.infer<typeof deadlineSchema>;

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 403) {
    return 'O seu perfil não tem permissão para alterar a inscrição desta atividade.';
  }
  if (error.status === 409 || error.status === 400 || error.status === 422) return error.message;
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
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const form = useForm<DeadlineValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: { prazoInscricao: '', prazoHora: '' },
  });
  const action = activity?.inscricao?.aberta === false ? 'reopen' : 'close';
  const text = TEXT[action];

  function reset() {
    setFailure(null);
    setExpiredAt(null);
    form.reset();
  }

  function close() {
    if (busy) return;
    reset();
    onClose();
  }

  async function save(deadline?: DeadlineValues) {
    if (!activity) return;
    setBusy(true);
    setFailure(null);
    try {
      // A lista não traz a versão da configuração; a leitura imediata evita salvar sobre outra.
      const { versao, prazoInscricao, prazoHora } = await freshRegistration(activity.id);
      if (action === 'reopen' && !deadline && deadlinePassed(prazoInscricao, prazoHora)) {
        setExpiredAt(formatDeadline(prazoInscricao, prazoHora));
        return;
      }
      await update.mutateAsync({
        versao,
        aberta: action === 'reopen',
        ...(deadline && {
          prazoInscricao: deadline.prazoInscricao,
          prazoHora: deadline.prazoHora || null,
        }),
      });
      reset();
      onClose();
      onDone(text.done);
    } catch (error) {
      if (
        deadline &&
        error instanceof ApiError &&
        (error.code === 'DEADLINE_INVALID' || error.code === 'DEADLINE_PASSED')
      ) {
        form.setError('prazoInscricao', { type: 'server', message: error.message });
        return;
      }
      setFailure(failureOf(error));
    } finally {
      setBusy(false);
    }
  }

  const confirm = expiredAt ? form.handleSubmit((values) => save(values)) : () => save();

  return (
    <AlertDialog open={activity !== null} onOpenChange={(next) => !next && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{text.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {expiredAt
              ? `O prazo de inscrição terminou em ${expiredAt}. Para reabrir, informe um prazo novo, até a data da atividade.`
              : `${activity?.titulo}: ${text.body}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {expiredAt && (
          <form noValidate onSubmit={confirm}>
            <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DateField
                control={form.control}
                name="prazoInscricao"
                label="Inscrições até"
                min={todayInBrasilia()}
                max={activity?.data}
              />
              <TimeField
                control={form.control}
                name="prazoHora"
                label="Hora do prazo"
                description="Sem hora, as inscrições vão até as 23h59."
              />
            </FieldGroup>
          </form>
        )}
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
            onClick={() => void confirm()}
          >
            {busy ? 'Aguarde…' : text.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
