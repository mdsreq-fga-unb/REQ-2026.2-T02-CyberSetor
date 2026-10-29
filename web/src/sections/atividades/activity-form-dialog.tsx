'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DateField, TextField } from '@/components/form/fields';
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ApiError } from '@/lib/api';
import { dateSchema } from '@/lib/schemas';
import { useEligibleResponsibles, useFreshActivity, useSaveActivity } from '@/queries/atividades';
import { useGoals } from '@/queries/metas';
import { useModalities } from '@/queries/modalidades';
import type { Activity } from '@/types/atividades';
import type { Project } from '@/types/projetos';
import { formatDate } from '@/lib/br';

const DATE = dateSchema();

function schemaFor(project: Project, saved: Activity | null) {
  const term = `${formatDate(project.inicio)} a ${formatDate(project.fim)}`;
  const dateChanged = (values: { data: string }) => !saved || values.data !== saved.data;
  return z
    .object({
      titulo: z
        .string()
        .trim()
        .min(1, 'Informe o título.')
        .max(200, 'O título tem no máximo 200 caracteres.'),
      modalidadeId: z.string().min(1, 'Escolha a modalidade.'),
      responsavelId: z.string().min(1, 'Escolha o responsável.'),
      data: DATE,
      local: z
        .string()
        .trim()
        .min(1, 'Informe o local.')
        .max(200, 'O local tem no máximo 200 caracteres.'),
      metaIds: z.array(z.string()).min(1, 'Selecione ao menos uma meta.'),
    })
    .refine(
      (values) =>
        !dateChanged(values) || (values.data >= project.inicio && values.data <= project.fim),
      {
        path: ['data'],
        message: `A data deve estar dentro do período de execução do projeto, de ${term}.`,
        when: (payload) => z.object({ data: DATE }).safeParse(payload.value).success,
      },
    );
}

type Schema = ReturnType<typeof schemaFor>;
type FormValues = z.input<Schema>;
type FieldName = keyof FormValues;

const EMPTY: FormValues = {
  titulo: '',
  modalidadeId: '',
  responsavelId: '',
  data: '',
  local: '',
  metaIds: [],
};

const FIELD_BY_CODE: Partial<Record<string, FieldName>> = {
  INVALID_MODALITY: 'modalidadeId',
  INVALID_RESPONSIBLE: 'responsavelId',
  OUTSIDE_PROJECT_PERIOD: 'data',
  META_OUTSIDE_PROJECT: 'metaIds',
};

function valuesOf(activity: Activity | null): FormValues {
  if (!activity) return EMPTY;
  return {
    titulo: activity.titulo,
    modalidadeId: activity.modalidade.id,
    responsavelId: activity.responsavel.id,
    data: activity.data,
    local: activity.local,
    metaIds: activity.metas.map((m) => m.id),
  };
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400) return error.message;
  if (error.status === 403) {
    return 'O seu perfil não tem permissão para cadastrar ou editar atividades.';
  }
  return 'Não foi possível salvar. Tente de novo.';
}

export function ActivityFormDialog({
  open,
  project,
  activity,
  onClose,
  onSaved,
}: {
  open: boolean;
  project: Project;
  activity: Activity | null;
  onClose: () => void;
  onSaved: (result: Activity) => void;
}) {
  const save = useSaveActivity(project.id);
  const freshActivity = useFreshActivity();
  const modalities = useModalities();
  const responsibles = useEligibleResponsibles(open);
  const goals = useGoals(project.id);

  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Activity | null>(null);
  const editing = current ?? activity;
  const schema = useMemo(() => schemaFor(project, editing), [project, editing]);
  const form = useForm<FormValues, unknown, z.output<Schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(valuesOf(activity));
  }, [open, activity, form]);

  const unavailableResponsible =
    editing &&
    responsibles.data &&
    !responsibles.data.some((person) => person.id === editing.responsavel.id)
      ? editing.responsavel
      : null;

  const unavailableModality =
    editing &&
    modalities.data &&
    !modalities.data.some((m) => m.id === editing.modalidade.id && m.ativo)
      ? editing.modalidade
      : null;

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const latest = await freshActivity(id);
    setCurrent(latest);
    form.reset(valuesOf(latest));
    setFailure(
      'Outra pessoa alterou esta atividade. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
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

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{activity ? 'Editar atividade' : 'Cadastrar atividade'}</DialogTitle>
          <DialogDescription>
            Vincule a atividade a uma modalidade e às metas do projeto {project.codigo}.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <TextField
              control={form.control}
              name="titulo"
              label="Nome / título da atividade"
              autoComplete="off"
            />

            <FormField
              name="modalidadeId"
              label="Modalidade de objeto"
              description="Apenas modalidades ativas cadastradas pelo Instituto."
              control={form.control}
            >
              {(props) => (
                <NativeSelect {...props} disabled={modalities.isPending}>
                  <NativeSelectOption value="" disabled>
                    {modalities.isPending ? 'Carregando…' : 'Escolha a modalidade'}
                  </NativeSelectOption>
                  {unavailableModality && (
                    <NativeSelectOption value={unavailableModality.id} disabled>
                      {unavailableModality.nome} (inativa)
                    </NativeSelectOption>
                  )}
                  {modalities.data
                    ?.filter((m) => m.ativo)
                    .map((m) => (
                      <NativeSelectOption key={m.id} value={m.id}>
                        {m.nome}
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                control={form.control}
                name="data"
                label="Data de realização"
                description={`Dentro do período do projeto: ${formatDate(project.inicio)} a ${formatDate(project.fim)}.`}
                min={project.inicio}
                max={project.fim}
              />
              <TextField control={form.control} name="local" label="Local" autoComplete="off" />
            </div>

            <FormField
              name="responsavelId"
              label="Responsável pela atividade"
              description="Qualquer conta ativa cadastrada."
              control={form.control}
            >
              {(props) => (
                <NativeSelect {...props} disabled={responsibles.isPending}>
                  <NativeSelectOption value="" disabled>
                    {responsibles.isPending ? 'Carregando…' : 'Escolha o responsável'}
                  </NativeSelectOption>
                  {unavailableResponsible && (
                    <NativeSelectOption value={unavailableResponsible.id} disabled>
                      {unavailableResponsible.nome} (conta desativada)
                    </NativeSelectOption>
                  )}
                  {responsibles.data?.map((person) => (
                    <NativeSelectOption key={person.id} value={person.id}>
                      {person.nome}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>

            <FormField
              name="metaIds"
              label="Metas atendidas"
              description="Selecione ao menos uma meta deste projeto."
              control={form.control}
            >
              {({ value, onChange, 'aria-describedby': ariaDescribedBy }) => (
                <div
                  role="group"
                  aria-label="Metas atendidas"
                  aria-describedby={ariaDescribedBy}
                  className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-md border border-input p-3"
                >
                  {goals.isPending && (
                    <p className="text-sm text-muted-foreground">Carregando metas…</p>
                  )}
                  {goals.data?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma meta cadastrada neste projeto.
                    </p>
                  )}
                  {goals.data?.map((goal, index) => {
                    const checked = Array.isArray(value) && value.includes(goal.id);
                    return (
                      <label
                        key={goal.id}
                        className="flex min-h-12 cursor-pointer items-center gap-3 py-1 text-sm font-normal"
                      >
                        <input
                          id={index === 0 ? 'metaIds' : undefined}
                          type="checkbox"
                          value={goal.id}
                          checked={checked}
                          onChange={(e) => {
                            const currentList = Array.isArray(value) ? value : [];
                            if (e.target.checked) {
                              onChange([...currentList, goal.id]);
                            } else {
                              onChange(currentList.filter((id: string) => id !== goal.id));
                            }
                          }}
                          className="size-5 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <span>
                          <strong className="font-medium">Meta {goal.ordem}</strong> —{' '}
                          {goal.objetivo}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </FormField>

            {modalities.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível carregar as modalidades. Feche e tente de novo.
              </p>
            )}
            {responsibles.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível carregar a lista de responsáveis. Feche e tente de novo.
              </p>
            )}
            {goals.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível carregar as metas do projeto. Feche e tente de novo.
              </p>
            )}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar atividade'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
