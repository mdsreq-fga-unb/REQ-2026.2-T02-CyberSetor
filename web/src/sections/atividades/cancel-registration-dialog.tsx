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
import { useCancelRegistration } from '@/queries/inscricoes';
import type { RegisteredPerson } from '@/types/inscricoes';
import { CANAIS_PEDIDO } from '@/types/participantes';
import { CANAL_LABEL } from '../participantes/format';

const schema = z.object({
  canal: z.enum(CANAIS_PEDIDO, { message: 'Escolha o canal do pedido.' }),
  pedidoEm: dateSchema('Informe a data do pedido.', {
    notFuture: 'A data não pode ser no futuro.',
  }),
});

type FormValues = z.input<typeof schema>;

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível cancelar a inscrição. Tente de novo.';
}

/** Cancelamento ou desistência pedido pela pessoa, com a data e o canal do pedido (HU-07c). */
export function CancelRegistrationDialog({
  activityId,
  person,
  onClose,
  onCancelled,
}: {
  activityId: string;
  person: RegisteredPerson | null;
  onClose: () => void;
  onCancelled: (person: RegisteredPerson) => void;
}) {
  const cancel = useCancelRegistration(activityId);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (person) {
      form.reset({ canal: '' as FormValues['canal'], pedidoEm: todayInBrasilia() });
    }
  }, [person, form]);

  function close() {
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!person) return;
    try {
      await cancel.mutateAsync({ inscricaoId: person.id, data: values });
      close();
      onCancelled(person);
    } catch (error) {
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const control = form.control;
  const releasesVacancy = person?.situacao === 'CONFIRMADA';

  return (
    <Dialog
      open={person !== null}
      onOpenChange={(next) => !next && !form.formState.isSubmitting && close()}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancelar inscrição</DialogTitle>
          <DialogDescription>
            {releasesVacancy
              ? `A vaga de ${person?.nome} fica livre e, com a promoção automática, passa para a primeira da lista de espera.`
              : `${person?.nome ?? 'A pessoa'} sai da lista de espera.`}{' '}
            O cancelamento não pode ser desfeito.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
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
                Voltar
              </Button>
              <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Cancelando…' : 'Cancelar inscrição'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
