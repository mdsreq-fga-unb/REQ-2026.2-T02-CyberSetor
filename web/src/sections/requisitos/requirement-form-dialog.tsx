'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { useFreshRequirement, useSaveRequirement } from '@/queries/requisitos';
import type { Instrument } from '@/types/instrumentos';
import type { Requirement } from '@/types/requisitos';

const schema = z.object({
  descricao: z
    .string()
    .trim()
    .min(1, 'Descreva o requisito.')
    .max(1000, 'O requisito tem no máximo 1.000 caracteres.'),
  referencia: z.string().trim().max(100, 'A referência tem no máximo 100 caracteres.'),
});

type FormValues = z.input<typeof schema>;

const EMPTY: FormValues = { descricao: '', referencia: '' };

function valuesOf(requirement: Requirement | null): FormValues {
  return requirement
    ? { descricao: requirement.descricao, referencia: requirement.referencia ?? '' }
    : EMPTY;
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400 || error.status === 404) return error.message;
  if (error.status === 403) return 'Só a Presidência e Gestão de Projetos cadastra requisitos.';
  return 'Não foi possível salvar. Tente de novo.';
}

export function RequirementFormDialog({
  open,
  instrument,
  requirement,
  onClose,
  onSaved,
}: {
  open: boolean;
  instrument: Instrument;
  requirement: Requirement | null;
  onClose: () => void;
  onSaved: (result: Requirement) => void;
}) {
  const save = useSaveRequirement(instrument.id);
  const freshRequirement = useFreshRequirement(instrument.id);
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Requirement | null>(null);
  const editing = current ?? requirement;
  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(valuesOf(requirement));
  }, [open, requirement, form]);

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshRequirement(id).catch(() => null);
    if (!fresh) {
      setFailure('O requisito não foi encontrado. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset(valuesOf(fresh));
    setFailure(
      'Outra pessoa alterou este requisito. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
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

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{requirement ? 'Editar requisito' : 'Novo requisito'}</DialogTitle>
          <DialogDescription>
            Requisito do instrumento do processo {instrument.numeroProcesso}.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormField name="descricao" label="Requisito" control={form.control}>
              {(props) => <Textarea {...props} />}
            </FormField>
            <FormField
              name="referencia"
              label="Referência (opcional)"
              description="Onde o requisito aparece no instrumento, como um item do termo de referência."
              control={form.control}
            >
              {(props) => <Input {...props} autoComplete="off" />}
            </FormField>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar requisito'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
