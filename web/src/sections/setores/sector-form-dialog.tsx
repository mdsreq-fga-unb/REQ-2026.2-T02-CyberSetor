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
import { ApiError } from '@/lib/api';
import { useFreshSector, useSaveSector } from '@/queries/setores';
import type { Sector } from '@/types/setores';

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome do setor.')
    .max(120, 'O nome tem no máximo 120 caracteres.'),
});

type FormValues = z.input<typeof schema>;

export function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400 || error.status === 404) return error.message;
  if (error.status === 403) return 'Só a Presidência e Gestão de Projetos cadastra setores.';
  return 'Não foi possível salvar. Tente de novo.';
}

export function SectorFormDialog({
  open,
  sector,
  onClose,
  onSaved,
}: {
  open: boolean;
  sector: Sector | null;
  onClose: () => void;
  onSaved: (result: Sector) => void;
}) {
  const save = useSaveSector();
  const freshSector = useFreshSector();
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Sector | null>(null);
  const editing = current ?? sector;
  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '' },
  });

  useEffect(() => {
    if (open) form.reset({ nome: sector?.nome ?? '' });
  }, [open, sector, form]);

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshSector(id).catch(() => null);
    if (!fresh) {
      setFailure('O setor não foi encontrado. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset({ nome: fresh.nome });
    setFailure(
      'Outra pessoa alterou este setor. O campo mostra a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onValid(data: z.output<typeof schema>) {
    try {
      const result = await save.mutateAsync({
        id: editing?.id,
        versao: editing?.versao,
        nome: data.nome,
      });
      close();
      onSaved(result);
    } catch (error) {
      if (editing && error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        await reloadAfterConflict(editing.id);
        return;
      }
      if (error instanceof ApiError && error.code === 'SECTOR_NAME_TAKEN') {
        form.setError('nome', { type: 'server', message: error.message }, { shouldFocus: true });
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
          <DialogTitle>{sector ? 'Editar setor' : 'Novo setor'}</DialogTitle>
          <DialogDescription>
            Setor do Instituto, como uma coordenação ou diretoria. Cada pessoa da equipe fica lotada
            em um setor, e cada meta tem um setor executor.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormField name="nome" label="Nome" control={form.control}>
              {(props) => <Input {...props} autoComplete="off" />}
            </FormField>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar setor'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
