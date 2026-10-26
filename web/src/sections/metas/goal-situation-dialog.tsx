'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { useChangeSituation } from '@/queries/metas';
import type { Goal, GoalSituation } from '@/types/metas';
import { SITUATIONS, SITUATION_ORDER } from './format';

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível salvar. Tente de novo.';
}

export function GoalSituationDialog({
  open,
  projectId,
  goal,
  onClose,
  onChanged,
  onConflict,
}: {
  open: boolean;
  projectId: string;
  goal: Goal | null;
  onClose: () => void;
  onChanged: (goal: Goal) => void;
  onConflict: (goal: Goal) => void;
}) {
  const change = useChangeSituation(projectId);
  const [chosen, setChosen] = useState<GoalSituation | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState<string | null>(null);
  const justificationRef = useRef<HTMLTextAreaElement>(null);
  const situacao = chosen ?? goal?.situacao ?? 'PENDENTE';
  const reopening = goal?.situacao === 'CONCLUIDA' && situacao !== 'CONCLUIDA';

  function close() {
    setChosen(null);
    setFailure(null);
    setJustification('');
    setJustificationError(null);
    onClose();
  }

  function missingJustification(message: string) {
    setJustificationError(message);
    justificationRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal) return;
    if (situacao === goal.situacao) return close();
    setFailure(null);
    setJustificationError(null);
    const justificativa = reopening ? justification.trim() : undefined;
    if (reopening && !justificativa) {
      return missingJustification('Informe a justificativa para reabrir a meta.');
    }
    try {
      const updated = await change.mutateAsync({ goal, situacao, justificativa });
      close();
      onChanged(updated);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        close();
        onConflict(goal);
        return;
      }
      if (error instanceof ApiError && error.code === 'JUSTIFICATION_REQUIRED') {
        return missingJustification(error.message);
      }
      setFailure(failureOf(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !change.isPending && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Situação da meta {goal?.ordem}</DialogTitle>
          <DialogDescription>{goal?.objetivo}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nova-situacao">Situação</FieldLabel>
              <NativeSelect
                id="nova-situacao"
                value={situacao}
                onChange={(event) => setChosen(event.target.value as GoalSituation)}
              >
                {SITUATION_ORDER.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {SITUATIONS[option]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {reopening && (
              <Field data-invalid={!!justificationError}>
                <FieldLabel htmlFor="justificativa">Justificativa</FieldLabel>
                <Textarea
                  ref={justificationRef}
                  id="justificativa"
                  value={justification}
                  maxLength={1000}
                  aria-invalid={!!justificationError}
                  aria-describedby={
                    justificationError
                      ? 'justificativa-ajuda justificativa-erro'
                      : 'justificativa-ajuda'
                  }
                  onChange={(event) => setJustification(event.target.value)}
                />
                <FieldDescription id="justificativa-ajuda">
                  A meta está concluída: para reabrir, diga o motivo. A justificativa fica
                  registrada e visível às demais áreas.
                </FieldDescription>
                {justificationError && (
                  <FieldError id="justificativa-erro" errors={[{ message: justificationError }]} />
                )}
              </Field>
            )}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={change.isPending}>
                {change.isPending ? 'Salvando…' : 'Salvar situação'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
