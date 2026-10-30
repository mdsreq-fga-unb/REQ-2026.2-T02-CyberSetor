'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DateField } from '@/components/form/fields';
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
import { todayInBrasilia } from '@/lib/br';
import { dateSchema } from '@/lib/schemas';
import { useRevokeAuthorization } from '@/queries/participantes';
import {
  AUTORIZACOES,
  CANAIS_PEDIDO,
  type Autorizacao,
  type Participant,
  type ParticipantRegistration,
} from '@/types/participantes';
import { AUTORIZACAO_LABEL, CANAL_LABEL, revocableOf } from './format';

const schema = z.object({
  autorizacao: z.enum(AUTORIZACOES, { message: 'Escolha a autorização.' }),
  canal: z.enum(CANAIS_PEDIDO, { message: 'Escolha o canal do pedido.' }),
  pedidoEm: dateSchema('Informe a data do pedido.', {
    notFuture: 'A data não pode ser no futuro.',
  }),
});

type FormValues = z.input<typeof schema>;

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível registrar a revogação. Tente de novo.';
}

/** Revogação de autorização pedida pelo titular, com a data e o canal do pedido (CA-07a.6). */
export function RevokeAuthorizationDialog({
  open,
  participant,
  registration,
  onClose,
  onRevoked,
}: {
  open: boolean;
  participant: Participant | null;
  registration: ParticipantRegistration | null;
  onClose: () => void;
  onRevoked: (participant: Participant) => void;
}) {
  const revoke = useRevokeAuthorization();
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const revocable = registration ? revocableOf(registration) : [];

  useEffect(() => {
    if (open && registration) {
      const [first] = revocableOf(registration);
      form.reset({
        autorizacao: first ?? ('' as Autorizacao),
        canal: '' as FormValues['canal'],
        pedidoEm: todayInBrasilia(),
      });
    }
  }, [open, registration, form]);

  function close() {
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!participant || !registration) return;
    try {
      const updated = await revoke.mutateAsync({
        id: participant.id,
        inscricaoId: registration.id,
        data: values,
      });
      close();
      onRevoked(updated);
    } catch (error) {
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar revogação</DialogTitle>
          <DialogDescription>
            {registration
              ? `Pedido de ${participant?.nome} para a inscrição em "${registration.atividade.titulo}". A inscrição continua valendo.`
              : 'A inscrição continua valendo.'}
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormField control={control} name="autorizacao" label="Autorização">
              {(props) => (
                <NativeSelect {...props}>
                  {revocable.map((autorizacao) => (
                    <NativeSelectOption key={autorizacao} value={autorizacao}>
                      {AUTORIZACAO_LABEL[autorizacao]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField control={control} name="canal" label="Canal do pedido">
              {(props) => (
                <NativeSelect {...props} value={props.value ?? ''}>
                  <NativeSelectOption value="" disabled>
                    Escolha o canal
                  </NativeSelectOption>
                  {CANAIS_PEDIDO.map((canal) => (
                    <NativeSelectOption key={canal} value={canal}>
                      {CANAL_LABEL[canal]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <DateField control={control} name="pedidoEm" label="Data do pedido" notFuture />
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registrando…' : 'Registrar revogação'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
