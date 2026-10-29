'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CpfField, DateField, PhoneField, TextField } from '@/components/form/fields';
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
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { isValidCpf } from '@/lib/br';
import { dateSchema, phoneSchema } from '@/lib/schemas';
import { useCorrectParticipant } from '@/queries/participantes';
import type { Participant, ParticipantCorrection } from '@/types/participantes';

const OPTIONAL = ['email', 'cpf', 'bairroRegiao', 'escolaridade'] as const;
const REQUIRED = ['nome', 'telefone', 'dataNascimento'] as const;

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome completo.')
    .max(150, 'O nome tem no máximo 150 caracteres.'),
  telefone: phoneSchema(),
  dataNascimento: dateSchema('Informe a data de nascimento.', {
    notFuture: 'A data não pode ser no futuro.',
  }),
  email: z.union([z.literal(''), z.email('Informe um e-mail válido.')]),
  cpf: z
    .string()
    .refine((value) => value === '' || isValidCpf(value), 'CPF inválido. Confira os números.'),
  bairroRegiao: z.string().trim().max(120, 'Use no máximo 120 caracteres.'),
  escolaridade: z.string().trim().max(120, 'Use no máximo 120 caracteres.'),
  justificativa: z
    .string()
    .trim()
    .min(10, 'Descreva o pedido do titular em pelo menos 10 caracteres.')
    .max(1000, 'A justificativa tem no máximo 1.000 caracteres.'),
});

type FormValues = z.input<typeof schema>;

function valuesOf(participant: Participant): FormValues {
  return {
    nome: participant.nome,
    telefone: participant.telefone,
    dataNascimento: participant.dataNascimento,
    email: participant.email ?? '',
    cpf: participant.cpf ?? '',
    bairroRegiao: participant.bairroRegiao ?? '',
    escolaridade: participant.escolaridade ?? '',
    justificativa: '',
  };
}

/** Só os campos alterados; campo opcional apagado vai como null. */
function correctionOf(participant: Participant, values: FormValues): ParticipantCorrection | null {
  const correction: ParticipantCorrection = {
    versao: participant.versao,
    justificativa: values.justificativa.trim(),
  };
  for (const field of REQUIRED) {
    const value = values[field].trim();
    if (value !== participant[field]) correction[field] = value;
  }
  for (const field of OPTIONAL) {
    const value = values[field].trim() || null;
    if (value !== participant[field]) correction[field] = value;
  }
  return Object.keys(correction).length > 2 ? correction : null;
}

const FIELD_BY_CODE: Partial<Record<string, keyof FormValues>> = {
  INVALID_CPF: 'cpf',
  INVALID_BIRTH_DATE: 'dataNascimento',
  GUARDIAN_REQUIRED: 'dataNascimento',
};

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível salvar a correção. Tente de novo.';
}

/** Correção dos dados a pedido do titular, com justificativa (HU-15a, RF26). */
export function CorrectParticipantDialog({
  open,
  participant,
  onClose,
  onCorrected,
  onConflict,
}: {
  open: boolean;
  participant: Participant | null;
  onClose: () => void;
  onCorrected: (participant: Participant) => void;
  onConflict: () => void;
}) {
  const correct = useCorrectParticipant();
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Abre com os dados atuais; depois de um conflito, recarrega com a versão nova.
    if (open && participant) form.reset(valuesOf(participant));
  }, [open, participant, form]);

  function close() {
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!participant) return;
    const correction = correctionOf(participant, values);
    if (!correction) {
      setFailure('Nenhum dado foi alterado.');
      return;
    }
    try {
      const corrected = await correct.mutateAsync({ id: participant.id, data: correction });
      close();
      onCorrected(corrected);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        onConflict();
        setFailure(
          'Outra pessoa alterou estes dados. O formulário mostra a versão atual: refaça a correção e salve de novo.',
        );
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

  const control = form.control;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Corrigir dados</DialogTitle>
          <DialogDescription>
            Correção pedida por {participant?.nome}. Registre o pedido na justificativa.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <TextField control={control} name="nome" label="Nome completo" autoComplete="off" />
            <div className="grid gap-4 sm:grid-cols-2">
              <PhoneField control={control} name="telefone" label="Telefone com DDD" />
              <DateField
                control={control}
                name="dataNascimento"
                label="Data de nascimento"
                notFuture
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                control={control}
                name="email"
                label="E-mail"
                type="email"
                inputMode="email"
                autoComplete="off"
              />
              <CpfField control={control} name="cpf" label="CPF" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                control={control}
                name="bairroRegiao"
                label="Bairro ou região"
                autoComplete="off"
              />
              <TextField
                control={control}
                name="escolaridade"
                label="Escolaridade"
                autoComplete="off"
              />
            </div>
            <FormField
              control={control}
              name="justificativa"
              label="Justificativa"
              description="Quem pediu, quando e por qual canal. Fica registrada com o seu nome, a data e a hora."
            >
              {(props) => <Textarea {...props} rows={3} />}
            </FormField>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar correção'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
