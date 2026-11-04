'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/br';
import { dateSchema } from '@/lib/schemas';
import { useCreatePlanVersion } from '@/queries/plano';
import type { Goal } from '@/types/metas';
import { TIPOS_VERSAO, type PlanVersionInput, type RepactuatedGoalInput } from '@/types/plano';
import { TIPO_LABEL } from './format';

const schema = z
  .object({
    tipo: z.enum(TIPOS_VERSAO, { message: 'Escolha o tipo de documento.' }),
    dataDocumento: dateSchema('Informe a data do documento.'),
    documentoOrigem: z.string().trim().min(1, 'Informe o documento de origem.').max(200),
    publicacao: z.string().trim().max(300),
    justificativa: z.string().trim().max(2000),
    vigenciaFim: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.tipo !== 'OFICIO') return;
    const required = [
      ['publicacao', 'Informe a publicação do ofício.'],
      ['justificativa', 'Informe a justificativa da mudança de período.'],
      ['vigenciaFim', 'Informe o novo fim da vigência.'],
    ] as const;
    for (const [path, message] of required) {
      if (!values[path]) ctx.addIssue({ code: 'custom', path: [path], message });
    }
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  tipo: 'TERMO_ADITIVO',
  dataDocumento: '',
  documentoOrigem: '',
  publicacao: '',
  justificativa: '',
  vigenciaFim: '',
};

interface GoalChange {
  parametro: string;
  periodoFim: string;
}

const NO_CHANGE: GoalChange = { parametro: '', periodoFim: '' };

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível registrar a nova versão. Tente de novo.';
}

/** Metas com alguma mudança, no formato do envio; campo em branco segue como está. */
function changesOf(goals: Goal[], changes: Record<string, GoalChange>): RepactuatedGoalInput[] {
  return goals.flatMap((goal) => {
    const change = changes[goal.id];
    const parametro = change?.parametro.trim();
    const periodoFim = change?.periodoFim;
    if (!parametro && !periodoFim) return [];
    return [
      {
        metaId: goal.id,
        versao: goal.versao,
        ...(parametro && { parametroPlanejado: parametro }),
        ...(periodoFim && { periodoFim }),
      },
    ];
  });
}

/**
 * Registro de termo aditivo, apostila ou ofício como nova versão do plano (HU-14, RF31), em duas
 * etapas: o documento de origem e as metas repactuadas. A seção monta o diálogo a cada abertura.
 */
export function PlanVersionDialog({
  projectId,
  goals,
  onClose,
  onSaved,
}: {
  projectId: string;
  goals: Goal[];
  onClose: () => void;
  onSaved: (numero: number) => void;
}) {
  const create = useCreatePlanVersion(projectId);
  const [step, setStep] = useState<'documento' | 'metas'>('documento');
  const [changes, setChanges] = useState<Record<string, GoalChange>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const tipo = useWatch({ control: form.control, name: 'tipo' });
  const oficio = tipo === 'OFICIO';
  const control = form.control;

  function change(id: string, field: keyof GoalChange, value: string) {
    setChanges((current) => ({
      ...current,
      [id]: { ...(current[id] ?? NO_CHANGE), [field]: value },
    }));
  }

  async function submit() {
    const values = form.getValues();
    const metas = changesOf(goals, changes);
    if (!oficio && metas.length === 0) {
      setFailure('Informe a mudança de ao menos uma meta.');
      return;
    }
    const data: PlanVersionInput = {
      tipo: values.tipo,
      dataDocumento: values.dataDocumento,
      documentoOrigem: values.documentoOrigem.trim(),
      metas,
      ...(values.publicacao && { publicacao: values.publicacao.trim() }),
      ...(values.justificativa && { justificativa: values.justificativa.trim() }),
      ...(oficio && { vigenciaFim: values.vigenciaFim }),
    };
    setFailure(null);
    try {
      const version = await create.mutateAsync(data);
      onClose();
      onSaved(version.numero);
    } catch (error) {
      setFailure(failureOf(error));
    }
  }

  const busy = create.isPending;

  return (
    <Dialog open onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-10">
          <DialogTitle>Nova versão do plano de trabalho</DialogTitle>
          <DialogDescription>
            {step === 'documento'
              ? 'Etapa 1 de 2: o documento que muda o plano.'
              : 'Etapa 2 de 2: as metas repactuadas. O que foi pactuado antes e os resultados já apurados ficam preservados.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'documento' ? (
          <form noValidate onSubmit={form.handleSubmit(() => setStep('metas'))}>
            <FieldGroup>
              <FormField control={control} name="tipo" label="Tipo de documento">
                {(props) => (
                  <NativeSelect {...props}>
                    {TIPOS_VERSAO.map((value) => (
                      <NativeSelectOption key={value} value={value}>
                        {TIPO_LABEL[value]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateField control={control} name="dataDocumento" label="Data do documento" />
                <TextField
                  control={control}
                  name="documentoOrigem"
                  label="Documento de origem"
                  placeholder="Termo Aditivo 1/2026"
                />
              </div>
              {oficio && (
                <>
                  <TextField control={control} name="publicacao" label="Publicação" />
                  <DateField control={control} name="vigenciaFim" label="Novo fim da vigência" />
                </>
              )}
              <FormField
                control={control}
                name="justificativa"
                label={oficio ? 'Justificativa' : 'Justificativa (opcional)'}
              >
                {(props) => <Textarea {...props} value={props.value ?? ''} />}
              </FormField>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Continuar</Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col divide-y rounded-lg border">
              {goals.map((goal) => (
                <li key={goal.id} className="flex flex-col gap-3 p-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">
                      {goal.ordem} · {goal.objetivo}
                    </span>
                    <span className="text-muted-foreground">
                      Previsto: {goal.parametroPlanejado ?? 'a definir'}
                      {goal.periodoFim && ` até ${formatDate(goal.periodoFim)}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      Novo parâmetro da meta {goal.ordem}
                      <Input
                        value={changes[goal.id]?.parametro ?? ''}
                        onChange={(event) => change(goal.id, 'parametro', event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Novo fim da meta {goal.ordem}
                      <Input
                        type="date"
                        value={changes[goal.id]?.periodoFim ?? ''}
                        onChange={(event) => change(goal.id, 'periodoFim', event.target.value)}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setStep('documento')}
              >
                Voltar
              </Button>
              <Button type="button" disabled={busy} onClick={() => void submit()}>
                {busy ? 'Registrando…' : 'Registrar versão'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
