'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ApiError } from '@/lib/api';
import { useEligibleCoordinators, useFreshProject, useSaveProject } from '@/queries/projetos';
import type { Instrument } from '@/types/instrumentos';
import type { Project } from '@/types/projetos';
import { formatDate } from '../instrumentos/format';

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data completa.');
const COORDINATION = 'contas ativas de Presidência e Gestão ou de Núcleo Pedagógico';

function schemaFor(instrument: Instrument) {
  const term = `${formatDate(instrument.vigenciaInicio)} a ${formatDate(instrument.vigenciaFim)}`;
  return z
    .object({
      codigo: z
        .string()
        .trim()
        .min(1, 'Informe o código.')
        .max(50, 'O código tem no máximo 50 caracteres.'),
      titulo: z
        .string()
        .trim()
        .min(1, 'Informe o título.')
        .max(200, 'O título tem no máximo 200 caracteres.'),
      coordenadorId: z.string().min(1, 'Escolha a coordenação.'),
      inicio: DATE,
      fim: DATE,
    })
    .refine((values) => values.fim >= values.inicio, {
      path: ['fim'],
      message: 'O fim da execução não pode ser anterior ao início.',
      when: (payload) => z.object({ inicio: DATE, fim: DATE }).safeParse(payload.value).success,
    })
    .refine((values) => values.inicio >= instrument.vigenciaInicio, {
      path: ['inicio'],
      message: `A execução começa dentro da vigência, de ${term}.`,
      when: (payload) => z.object({ inicio: DATE }).safeParse(payload.value).success,
    })
    .refine((values) => values.fim <= instrument.vigenciaFim, {
      path: ['fim'],
      message: `A execução termina dentro da vigência, de ${term}.`,
      when: (payload) => z.object({ fim: DATE }).safeParse(payload.value).success,
    });
}

type Schema = ReturnType<typeof schemaFor>;
type FormValues = z.input<Schema>;
type FieldName = keyof FormValues;

const EMPTY: FormValues = { codigo: '', titulo: '', coordenadorId: '', inicio: '', fim: '' };

const FIELD_BY_CODE: Partial<Record<string, FieldName>> = {
  PROJECT_CODE_TAKEN: 'codigo',
  INVALID_COORDINATOR: 'coordenadorId',
  INVALID_SCHEDULE: 'fim',
  OUTSIDE_INSTRUMENT_TERM: 'inicio',
};

function valuesOf(project: Project | null): FormValues {
  if (!project) return EMPTY;
  return {
    codigo: project.codigo,
    titulo: project.titulo,
    coordenadorId: project.coordenador.id,
    inicio: project.inicio,
    fim: project.fim,
  };
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400) return error.message;
  if (error.status === 403) return 'Só a Presidência e Gestão de Projetos cadastra projetos.';
  return 'Não foi possível salvar. Tente de novo.';
}

export function ProjectFormDialog({
  open,
  instrument,
  project,
  onClose,
  onSaved,
}: {
  open: boolean;
  instrument: Instrument;
  project: Project | null;
  onClose: () => void;
  onSaved: (result: Project) => void;
}) {
  const save = useSaveProject(instrument.id);
  const freshProject = useFreshProject();
  const coordinators = useEligibleCoordinators(open);
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Project | null>(null);
  const editing = current ?? project;
  const schema = useMemo(() => schemaFor(instrument), [instrument]);
  const form = useForm<FormValues, unknown, z.output<Schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(valuesOf(project));
  }, [open, project, form]);

  const unavailable =
    editing &&
    coordinators.data &&
    !coordinators.data.some((person) => person.id === editing.coordenador.id)
      ? editing.coordenador
      : null;

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshProject(id).catch(() => null);
    if (!fresh) {
      setFailure('O projeto não foi encontrado. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset(valuesOf(fresh));
    setFailure(
      'Outra pessoa alterou este projeto. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onValid(data: z.output<Schema>) {
    try {
      const result = await save.mutateAsync({ id: editing?.id, versao: editing?.versao, data });
      close();
      onSaved(result);
    } catch (error) {
      if (editing && error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        await reloadAfterConflict(editing.id);
        return;
      }
      const field = error instanceof ApiError ? FIELD_BY_CODE[error.code] : undefined;
      if (field && error instanceof ApiError) {
        form.setError(field, { type: 'server', message: error.message }, { shouldFocus: true });
        return;
      }
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const text = (name: FieldName, label: string, extra: object = {}, description?: string) => (
    <FormField name={name} label={label} description={description} control={form.control}>
      {(props) => <Input {...props} {...extra} />}
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar projeto' : 'Novo projeto'}</DialogTitle>
          <DialogDescription>
            Projeto do instrumento do processo {instrument.numeroProcesso}.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            {text('codigo', 'Código', { autoComplete: 'off' }, 'Único neste instrumento.')}
            {text('titulo', 'Título', { autoComplete: 'off' })}
            <FormField
              name="coordenadorId"
              label="Coordenação"
              description={`Entre as ${COORDINATION}.`}
              control={form.control}
            >
              {(props) => (
                <NativeSelect {...props} disabled={coordinators.isPending}>
                  <NativeSelectOption value="" disabled>
                    {coordinators.isPending ? 'Carregando…' : 'Escolha a coordenação'}
                  </NativeSelectOption>
                  {unavailable && (
                    <NativeSelectOption value={unavailable.id} disabled>
                      {unavailable.nome} (
                      {unavailable.ativo ? 'perfil sem coordenação' : 'conta desativada'})
                    </NativeSelectOption>
                  )}
                  {coordinators.data?.map((person) => (
                    <NativeSelectOption key={person.id} value={person.id}>
                      {person.nome}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              {text(
                'inicio',
                'Início da execução',
                { type: 'date' },
                `Dentro da vigência: ${formatDate(instrument.vigenciaInicio)} a ${formatDate(instrument.vigenciaFim)}.`,
              )}
              {text('fim', 'Fim da execução', { type: 'date' })}
            </div>
            {coordinators.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível carregar a lista de coordenação. Feche e tente de novo.
              </p>
            )}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar projeto'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
