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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ApiError } from '@/lib/api';
import { useFreshInstrument, useSaveInstrument } from '@/queries/instrumentos';
import type { Instrument, InstrumentType, SavedInstrument } from '@/types/instrumentos';
import { INSTRUMENT_TYPES, moneyInput, parseMoney } from './format';

const TYPES = Object.keys(INSTRUMENT_TYPES) as InstrumentType[];
const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data completa.');
const TERM = z.object({ vigenciaInicio: DATE, vigenciaFim: DATE });

const schema = z
  .object({
    tipo: z.enum(TYPES, 'Escolha o tipo.'),
    orgaoConcedente: z
      .string()
      .trim()
      .min(1, 'Informe o órgão concedente.')
      .max(200, 'O órgão tem no máximo 200 caracteres.'),
    numeroProcesso: z
      .string()
      .trim()
      .min(1, 'Informe o número do processo.')
      .max(100, 'O número tem no máximo 100 caracteres.'),
    valorGlobal: z.string().transform((value, ctx) => {
      const parsed = parseMoney(value);
      if ('error' in parsed) {
        ctx.addIssue({ code: 'custom', message: parsed.error });
        return z.NEVER;
      }
      return parsed.value;
    }),
    dataCelebracao: DATE,
    vigenciaInicio: DATE,
    vigenciaFim: DATE,
  })
  .refine((values) => values.vigenciaFim >= values.vigenciaInicio, {
    path: ['vigenciaFim'],
    message: 'O fim da vigência não pode ser anterior ao início.',
    when: (payload) => TERM.safeParse(payload.value).success,
  });

type FormValues = z.input<typeof schema>;
type FieldName = keyof FormValues;

const EMPTY = {
  tipo: '',
  orgaoConcedente: '',
  numeroProcesso: '',
  valorGlobal: '',
  dataCelebracao: '',
  vigenciaInicio: '',
  vigenciaFim: '',
} as unknown as FormValues;

function valuesOf(instrument: Instrument | null): FormValues {
  if (!instrument) return EMPTY;
  return {
    tipo: instrument.tipo,
    orgaoConcedente: instrument.orgaoConcedente,
    numeroProcesso: instrument.numeroProcesso,
    valorGlobal: moneyInput(instrument.valorGlobal),
    dataCelebracao: instrument.dataCelebracao,
    vigenciaInicio: instrument.vigenciaInicio,
    vigenciaFim: instrument.vigenciaFim,
  };
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400) return error.message;
  if (error.status === 403) return 'Só a Presidência e Gestão de Projetos cadastra instrumentos.';
  return 'Não foi possível salvar. Tente de novo.';
}

export function InstrumentFormDialog({
  open,
  instrument,
  onClose,
  onSaved,
}: {
  open: boolean;
  instrument: Instrument | null;
  onClose: () => void;
  onSaved: (result: SavedInstrument) => void;
}) {
  const save = useSaveInstrument();
  const freshInstrument = useFreshInstrument();
  const [failure, setFailure] = useState<string | null>(null);
  const [current, setCurrent] = useState<Instrument | null>(null);
  const editing = current ?? instrument;
  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(valuesOf(instrument));
  }, [open, instrument, form]);

  function close() {
    setFailure(null);
    setCurrent(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const fresh = await freshInstrument(id).catch(() => null);
    if (!fresh) {
      setFailure('O instrumento não foi encontrado. Feche e confira a lista.');
      return;
    }
    setCurrent(fresh);
    form.reset(valuesOf(fresh));
    setFailure(
      'Outra pessoa alterou este instrumento. Os campos mostram a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onValid(data: z.output<typeof schema>) {
    try {
      const result = await save.mutateAsync({
        id: editing?.id,
        versao: editing?.versao,
        data,
      });
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

  const text = (name: FieldName, label: string, extra: object = {}) => (
    <FormField name={name} label={label} control={form.control}>
      {(props) => <Input {...props} {...extra} />}
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{instrument ? 'Editar instrumento' : 'Novo instrumento'}</DialogTitle>
          <DialogDescription>
            Instrumento de parceria com o poder público, como consta do documento que o celebra.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormField name="tipo" label="Tipo" control={form.control}>
              {(props) => (
                <NativeSelect {...props}>
                  <NativeSelectOption value="" disabled>
                    Escolha o tipo
                  </NativeSelectOption>
                  {TYPES.map((tipo) => (
                    <NativeSelectOption key={tipo} value={tipo}>
                      {INSTRUMENT_TYPES[tipo]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            {text('orgaoConcedente', 'Órgão concedente', { autoComplete: 'off' })}
            {text('numeroProcesso', 'Número do processo', { autoComplete: 'off' })}
            {text('valorGlobal', 'Valor global (R$)', {
              inputMode: 'decimal',
              autoComplete: 'off',
            })}
            <div className="grid gap-4 sm:grid-cols-3">
              {text('dataCelebracao', 'Data de celebração', { type: 'date' })}
              {text('vigenciaInicio', 'Início da vigência', { type: 'date' })}
              {text('vigenciaFim', 'Fim da vigência', { type: 'date' })}
            </div>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar instrumento'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
