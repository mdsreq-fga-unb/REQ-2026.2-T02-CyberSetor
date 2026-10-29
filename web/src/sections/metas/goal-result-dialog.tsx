'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { useRecordResult } from '@/queries/metas';
import type { Goal, GoalReach, GoalResult } from '@/types/metas';
import { DateField, DecimalField } from '@/components/form/fields';
import { formatNumber, todayInBrasilia } from '@/lib/br';
import { dateSchema } from '@/lib/schemas';
import { REACHES, plannedNumber, reachOf } from './format';

const DECIMAL = /^\d+(\.\d{1,2})?$/;

function schemaFor(quantitative: boolean) {
  return z
    .object({
      dataReferencia: dateSchema('Informe a data de referência.', {
        notFuture: 'A data de referência não pode ser futura.',
      }),
      descricao: z
        .string()
        .trim()
        .min(1, 'Descreva o resultado alcançado.')
        .max(2000, 'A descrição tem no máximo 2.000 caracteres.'),
      valorAlcancado: z.string().trim(),
      alcance: z.string(),
    })
    .refine((values) => !quantitative || DECIMAL.test(values.valorAlcancado), {
      path: ['valorAlcancado'],
      message: 'Informe o valor alcançado, um número com até duas casas decimais.',
    })
    .refine((values) => quantitative || values.alcance !== '', {
      path: ['alcance'],
      message: 'Escolha a classificação do alcance.',
    });
}

type FormValues = z.input<ReturnType<typeof schemaFor>>;

const FIELD_BY_CODE: Partial<Record<string, keyof FormValues>> = {
  FUTURE_REFERENCE_DATE: 'dataReferencia',
  RESULT_VALUE_REQUIRED: 'valorAlcancado',
  RESULT_REACH_REQUIRED: 'alcance',
};

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível registrar o resultado. Tente de novo.';
}

export function GoalResultDialog({
  open,
  projectId,
  goal,
  onClose,
  onRecorded,
}: {
  open: boolean;
  projectId: string;
  goal: Goal | null;
  onClose: () => void;
  onRecorded: (goal: Goal, result: GoalResult) => void;
}) {
  const record = useRecordResult(projectId);
  const [failure, setFailure] = useState<string | null>(null);
  const planned =
    goal?.modalidadeAfericao === 'QUANTITATIVA' ? plannedNumber(goal.parametroPlanejado) : null;
  const quantitative = planned !== null;
  const schema = useMemo(() => schemaFor(quantitative), [quantitative]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dataReferencia: '', descricao: '', valorAlcancado: '', alcance: '' },
  });
  const typed = useWatch({ control: form.control, name: 'valorAlcancado' });
  const reached = DECIMAL.test(typed) ? Number(typed) : null;
  const percent =
    planned !== null && reached !== null ? Math.round((reached / planned) * 10000) / 100 : null;

  useEffect(() => {
    if (open) {
      form.reset({
        dataReferencia: todayInBrasilia(),
        descricao: '',
        valorAlcancado: '',
        alcance: '',
      });
    }
  }, [open, form]);

  function close() {
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!goal) return;
    try {
      const result = await record.mutateAsync({
        goal,
        data: {
          dataReferencia: values.dataReferencia,
          descricao: values.descricao.trim(),
          ...(quantitative
            ? { valorAlcancado: Number(values.valorAlcancado) }
            : { alcance: values.alcance as GoalReach }),
        },
      });
      close();
      onRecorded(goal, result);
    } catch (error) {
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resultado da meta {goal?.ordem}</DialogTitle>
          <DialogDescription>{goal?.objetivo}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <DateField
              control={form.control}
              name="dataReferencia"
              label="Data de referência"
              description="Até quando o resultado vale."
              notFuture
            />
            {quantitative ? (
              <DecimalField
                control={form.control}
                name="valorAlcancado"
                label={`Valor alcançado${goal?.unidade ? ` (${goal.unidade})` : ''}`}
                description={`Planejado: ${formatNumber(planned)}${goal?.unidade ? ` ${goal.unidade}` : ''}. O percentual e a classificação são calculados.`}
              />
            ) : (
              <FormField name="alcance" label="Alcance" control={form.control}>
                {(props) => (
                  <NativeSelect {...props}>
                    <NativeSelectOption value="" disabled>
                      Escolha a classificação
                    </NativeSelectOption>
                    {Object.entries(REACHES).map(([value, label]) => (
                      <NativeSelectOption key={value} value={value}>
                        {label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
            )}
            {percent !== null && (
              <p role="status" className="text-sm text-muted-foreground">
                {formatNumber(percent)}% do planejado · {REACHES[reachOf(percent)]}
              </p>
            )}
            <FormField name="descricao" label="Descrição do resultado" control={form.control}>
              {(props) => <Textarea {...props} />}
            </FormField>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registrando…' : 'Registrar resultado'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
