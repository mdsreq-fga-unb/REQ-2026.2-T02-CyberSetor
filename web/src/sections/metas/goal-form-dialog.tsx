'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { useEligibleOwners, useFreshGoal, useSaveGoal } from '@/queries/metas';
import { useSectors } from '@/queries/setores';
import type { Goal, GoalInput } from '@/types/metas';
import type { Requirement } from '@/types/requisitos';
import { formatDate } from '../instrumentos/format';
import { GOAL_ORIGINS, MEASUREMENT_MODES } from './format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const COMPLETION_FIELDS = ['indicador', 'formaComprovacao', 'periodoInicio', 'periodoFim'] as const;

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Este campo tem no máximo ${max.toLocaleString('pt-BR')} caracteres.`);

const date = z
  .string()
  .refine((value) => value === '' || DATE.test(value), 'Informe a data completa.')
  .transform((value) => value || null);

interface Execution {
  inicio: string;
  fim: string;
}

const PLANNED = /^\d+([.,]\d{1,2})?$/;

const plannedParse = (payload: { value: unknown }) =>
  z
    .object({ modalidadeAfericao: z.string(), parametroPlanejado: z.string() })
    .safeParse(payload.value).success;

const datesParse = (payload: { value: unknown }) =>
  z.object({ periodoInicio: date, periodoFim: date }).safeParse(payload.value).success;

const schemaFor = (execution: Execution) => {
  const outside = `Escolha uma data dentro da execução do projeto, de ${formatDate(execution.inicio)} a ${formatDate(execution.fim)}.`;
  const inside = (value: string | null) =>
    !value || (value >= execution.inicio && value <= execution.fim);
  return z
    .object({
      origem: z.enum(['EDITAL', 'PROJETO', 'INSTITUTO'], { error: 'Escolha a origem da meta.' }),
      objetivo: text(500).min(1, 'Informe o objetivo.'),
      descricao: text(2000).min(1, 'Descreva a meta.'),
      requisitoIds: z.array(z.string()).max(50, 'Selecione no máximo 50 requisitos.'),
      indicador: text(500),
      modalidadeAfericao: z
        .enum(['', 'QUANTITATIVA', 'QUALITATIVA'])
        .transform((value) => value || null),
      parametroPlanejado: text(100),
      unidade: text(50),
      periodoInicio: date,
      periodoFim: date,
      frequenciaApuracao: text(100),
      formaComprovacao: text(1000),
      resultadoEsperado: text(1000),
      responsavelId: z.string().transform((value) => value || null),
      setorId: z.string().transform((value) => value || null),
    })
    .refine(
      (values) =>
        !values.periodoInicio || !values.periodoFim || values.periodoFim >= values.periodoInicio,
      {
        path: ['periodoFim'],
        message: 'O fim do período não pode ser anterior ao início.',
        when: datesParse,
      },
    )
    .refine((values) => inside(values.periodoInicio), {
      path: ['periodoInicio'],
      message: outside,
      when: datesParse,
    })
    .refine((values) => inside(values.periodoFim), {
      path: ['periodoFim'],
      message: outside,
      when: datesParse,
    })
    .refine(
      (values) =>
        values.modalidadeAfericao !== 'QUANTITATIVA' ||
        !values.parametroPlanejado ||
        (PLANNED.test(values.parametroPlanejado) &&
          Number(values.parametroPlanejado.replace(',', '.')) > 0),
      {
        path: ['parametroPlanejado'],
        message:
          'Na meta quantitativa, informe um número maior que zero, com até duas casas decimais.',
        when: plannedParse,
      },
    );
};

type GoalSchema = ReturnType<typeof schemaFor>;
type FormValues = z.input<GoalSchema>;
type FieldName = keyof FormValues;
type TextField = Exclude<
  FieldName,
  'origem' | 'requisitoIds' | 'modalidadeAfericao' | 'responsavelId' | 'setorId'
>;

const EMPTY: FormValues = {
  origem: '' as FormValues['origem'],
  objetivo: '',
  descricao: '',
  requisitoIds: [],
  indicador: '',
  modalidadeAfericao: '',
  parametroPlanejado: '',
  unidade: '',
  periodoInicio: '',
  periodoFim: '',
  frequenciaApuracao: '',
  formaComprovacao: '',
  resultadoEsperado: '',
  responsavelId: '',
  setorId: '',
};

const FIELD_BY_CODE: Partial<Record<string, FieldName>> = {
  GOAL_REQUIREMENT_REQUIRED: 'requisitoIds',
  REQUIREMENT_OUTSIDE_INSTRUMENT: 'requisitoIds',
  INVALID_PERIOD: 'periodoFim',
  OUTSIDE_PROJECT_EXECUTION: 'periodoFim',
  INVALID_PLANNED_VALUE: 'parametroPlanejado',
};

function valuesOf(goal: Goal | null): FormValues {
  if (!goal) return EMPTY;
  return {
    origem: goal.origem,
    objetivo: goal.objetivo,
    descricao: goal.descricao,
    requisitoIds: goal.requisitos.map((requirement) => requirement.id),
    indicador: goal.indicador ?? '',
    modalidadeAfericao: goal.modalidadeAfericao ?? '',
    parametroPlanejado: goal.parametroPlanejado ?? '',
    unidade: goal.unidade ?? '',
    periodoInicio: goal.periodoInicio ?? '',
    periodoFim: goal.periodoFim ?? '',
    frequenciaApuracao: goal.frequenciaApuracao ?? '',
    formaComprovacao: goal.formaComprovacao ?? '',
    resultadoEsperado: goal.resultadoEsperado ?? '',
    responsavelId: goal.responsavel?.id ?? '',
    setorId: goal.setor?.id ?? '',
  };
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400 || error.status === 404) return error.message;
  if (error.status === 403) return 'Só a Presidência e Gestão de Projetos cadastra metas.';
  return 'Não foi possível salvar. Tente de novo.';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      {children}
    </FieldSet>
  );
}

export function GoalFormDialog({
  open,
  projectId,
  execution,
  requirements,
  goal,
  onClose,
  onSaved,
}: {
  open: boolean;
  projectId: string;
  execution: Execution;
  requirements: Requirement[];
  goal: Goal | null;
  onClose: () => void;
  onSaved: (result: Goal) => void;
}) {
  const save = useSaveGoal(projectId);
  const owners = useEligibleOwners(open);
  const sectors = useSectors(open);
  const freshGoal = useFreshGoal(projectId);
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Goal | null>(null);
  const editing = current ?? goal;
  const schema = useMemo(() => schemaFor(execution), [execution]);
  const form = useForm<FormValues, unknown, z.output<GoalSchema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const completion = useWatch({ control: form.control, name: COMPLETION_FIELDS });
  const [mode, planned] = useWatch({
    control: form.control,
    name: ['modalidadeAfericao', 'parametroPlanejado'],
  });
  const becomesDraft =
    editing !== null &&
    !editing.rascunho &&
    (completion.some((value) => !value.trim()) || (mode === 'QUANTITATIVA' && !planned.trim()));

  useEffect(() => {
    if (open) form.reset(valuesOf(goal));
  }, [open, goal, form]);

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshGoal(id).catch(() => null);
    if (!fresh) {
      setFailure('A meta não foi encontrada. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset(valuesOf(fresh));
    setFailure(
      'Outra pessoa alterou esta meta. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onValid(data: GoalInput) {
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

  const dateLimits = { type: 'date', min: execution.inicio, max: execution.fim };

  const input = (name: TextField, label: string, extra: object = {}) => (
    <FormField name={name} label={label} control={form.control}>
      {(props) => <Input {...props} autoComplete="off" {...extra} />}
    </FormField>
  );

  const area = (name: TextField, label: string) => (
    <FormField name={name} label={label} control={form.control}>
      {(props) => <Textarea {...props} />}
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? `Editar meta ${goal.ordem}` : 'Nova meta'}</DialogTitle>
          <DialogDescription>
            Sem indicador, forma de comprovação, início e fim do período e, na meta quantitativa,
            sem parâmetro planejado, a meta fica como rascunho e não entra na apuração.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormField name="origem" label="Origem" control={form.control}>
              {(props) => (
                <NativeSelect {...props}>
                  <NativeSelectOption value="" disabled>
                    Escolha a origem
                  </NativeSelectOption>
                  {Object.entries(GOAL_ORIGINS).map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            {input('objetivo', 'Objetivo')}
            {area('descricao', 'Descrição')}
            <Controller
              name="requisitoIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet
                  data-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? 'requisitoIds-error' : undefined}
                >
                  <FieldLegend variant="label">Requisitos do instrumento atendidos</FieldLegend>
                  {requirements.map((requirement, index) => (
                    <label
                      key={requirement.id}
                      className="flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2"
                    >
                      <input
                        ref={index === 0 ? field.ref : undefined}
                        type="checkbox"
                        className="size-5 shrink-0 accent-primary"
                        checked={field.value.includes(requirement.id)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.checked
                              ? [...field.value, requirement.id]
                              : field.value.filter((id) => id !== requirement.id),
                          )
                        }
                      />
                      <span className="text-sm">
                        {requirement.referencia && (
                          <span className="font-medium">{requirement.referencia} · </span>
                        )}
                        {requirement.descricao}
                      </span>
                    </label>
                  ))}
                  {fieldState.invalid && (
                    <FieldError id="requisitoIds-error" errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
            <Section title="Aferição">
              {input('indicador', 'Indicador')}
              <FormField name="modalidadeAfericao" label="Modalidade" control={form.control}>
                {(props) => (
                  <NativeSelect {...props}>
                    <NativeSelectOption value="">A definir</NativeSelectOption>
                    {Object.entries(MEASUREMENT_MODES).map(([value, label]) => (
                      <NativeSelectOption key={value} value={value}>
                        {label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  name="parametroPlanejado"
                  label="Parâmetro planejado"
                  description="Na meta quantitativa, um número: por exemplo, 120 ou 12,5."
                  control={form.control}
                >
                  {(props) => <Input {...props} autoComplete="off" inputMode="decimal" />}
                </FormField>
                {input('unidade', 'Unidade')}
              </div>
              {input('frequenciaApuracao', 'Frequência de apuração')}
              {area('formaComprovacao', 'Forma de comprovação')}
            </Section>
            <Section title="Responsável e setor">
              <FormField name="responsavelId" label="Responsável" control={form.control}>
                {(props) => (
                  <NativeSelect
                    {...props}
                    disabled={!owners.isSuccess}
                    onChange={(event) => {
                      props.onChange(event);
                      const owner = owners.data?.find((item) => item.id === event.target.value);
                      const sector = sectors.data?.find((item) => item.id === owner?.setor?.id);
                      if (sector?.ativo && !form.getValues('setorId')) {
                        form.setValue('setorId', sector.id);
                      }
                    }}
                  >
                    <NativeSelectOption value="">
                      {owners.isPending ? 'Carregando…' : 'Sem responsável'}
                    </NativeSelectOption>
                    {editing?.responsavel &&
                      !owners.data?.some((item) => item.id === editing.responsavel?.id) && (
                        <NativeSelectOption value={editing.responsavel.id} disabled>
                          {editing.responsavel.nome} (
                          {editing.responsavel.ativo ? 'indisponível' : 'conta desativada'})
                        </NativeSelectOption>
                      )}
                    {owners.data?.map((owner) => (
                      <NativeSelectOption key={owner.id} value={owner.id}>
                        {owner.nome}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <FormField name="setorId" label="Setor executor" control={form.control}>
                {(props) => (
                  <NativeSelect {...props} disabled={!sectors.isSuccess}>
                    <NativeSelectOption value="">
                      {sectors.isPending ? 'Carregando…' : 'Sem setor'}
                    </NativeSelectOption>
                    {sectors.data
                      ?.filter((sector) => sector.ativo || sector.id === editing?.setor?.id)
                      .map((sector) => (
                        <NativeSelectOption
                          key={sector.id}
                          value={sector.id}
                          disabled={!sector.ativo}
                        >
                          {sector.nome}
                          {sector.ativo ? '' : ' (inativo)'}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                )}
              </FormField>
              {(owners.isError || sectors.isError) && (
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível carregar os responsáveis ou os setores. Feche e tente de novo.
                </p>
              )}
            </Section>
            <Section title="Período">
              <FieldDescription>
                Dentro da execução do projeto, de {formatDate(execution.inicio)} a{' '}
                {formatDate(execution.fim)}.
              </FieldDescription>
              <div className="grid gap-4 sm:grid-cols-2">
                {input('periodoInicio', 'Início', dateLimits)}
                {input('periodoFim', 'Fim (prazo)', dateLimits)}
              </div>
            </Section>
            {area('resultadoEsperado', 'Resultado esperado')}
            {becomesDraft && (
              <p role="status" className="text-sm text-muted-foreground">
                Ao salvar, a meta volta a ser rascunho e sai da apuração.
              </p>
            )}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar meta'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
