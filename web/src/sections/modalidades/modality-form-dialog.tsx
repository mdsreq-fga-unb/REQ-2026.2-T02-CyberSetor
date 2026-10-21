'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { useFreshModality, useSaveModality } from '@/queries/modalidades';
import type { Modality } from '@/types/modalidades';

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome da modalidade.')
    .max(120, 'O nome tem no máximo 120 caracteres.'),
  descricao: z.string().trim().max(500, 'A descrição tem no máximo 500 caracteres.'),
});

type FormValues = z.input<typeof schema>;
type FieldName = keyof FormValues;

const EMPTY: FormValues = { nome: '', descricao: '' };

function valuesOf(modality: Modality | null): FormValues {
  return modality ? { nome: modality.nome, descricao: modality.descricao ?? '' } : EMPTY;
}

export function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400 || error.status === 404) return error.message;
  if (error.status === 403) {
    return 'Só o Núcleo Pedagógico e a Presidência e Gestão cadastram modalidades.';
  }
  return 'Não foi possível salvar. Tente de novo.';
}

export function ModalityFormDialog({
  open,
  modality,
  onClose,
  onSaved,
}: {
  open: boolean;
  modality: Modality | null;
  onClose: () => void;
  onSaved: (result: Modality) => void;
}) {
  const save = useSaveModality();
  const freshModality = useFreshModality();
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Modality | null>(null);
  const editing = current ?? modality;
  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(valuesOf(modality));
  }, [open, modality, form]);

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshModality(id).catch(() => null);
    if (!fresh) {
      setFailure('A modalidade não foi encontrada. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset(valuesOf(fresh));
    setFailure(
      'Outra pessoa alterou esta modalidade. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onValid(data: z.output<typeof schema>) {
    try {
      const result = await save.mutateAsync({ id: editing?.id, versao: editing?.versao, data });
      close();
      onSaved(result);
    } catch (error) {
      if (editing && error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        await reloadAfterConflict(editing.id);
        return;
      }
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const field = (name: FieldName, label: string) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field: props, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...props}
            id={name}
            autoComplete="off"
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? `${name}-error` : undefined}
          />
          {fieldState.invalid && <FieldError id={`${name}-error`} errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{modality ? 'Editar modalidade' : 'Nova modalidade'}</DialogTitle>
          <DialogDescription>
            Tipo de atividade que o Instituto realiza, como oficina contínua ou evento aberto.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            {field('nome', 'Nome')}
            {field('descricao', 'Descrição (opcional)')}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar modalidade'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
