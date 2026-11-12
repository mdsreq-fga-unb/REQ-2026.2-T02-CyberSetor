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
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { todayInBrasilia } from '@/lib/br';
import { dateSchema } from '@/lib/schemas';
import { useEraseParticipant, useErasurePlan } from '@/queries/participantes';
import {
  CANAIS_PEDIDO,
  MOTIVOS_ELIMINACAO,
  type ErasurePlan,
  type MotivoEliminacao,
  type Participant,
} from '@/types/participantes';
import { CANAL_LABEL } from './format';

const MOTIVO_LABEL: Record<MotivoEliminacao, string> = {
  PEDIDO_TITULAR: 'Pedido do titular',
  FIM_FINALIDADE: 'Fim da finalidade',
};

const schema = z.object({
  motivo: z.enum(MOTIVOS_ELIMINACAO, { message: 'Escolha o motivo.' }),
  canal: z.enum(CANAIS_PEDIDO, { message: 'Escolha o canal do pedido.' }),
  pedidoEm: dateSchema('Informe a data do pedido.', {
    notFuture: 'A data não pode ser no futuro.',
  }),
});

type FormValues = z.input<typeof schema>;

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if ([400, 403, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível atender o pedido. Tente de novo.';
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PlanSummary({ plan }: { plan: ErasurePlan }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <p className="text-sm">
        {plan.acao === 'EXCLUIR'
          ? 'A pessoa não tem inscrição em atividade já realizada: o cadastro é excluído.'
          : 'A pessoa tem inscrição em atividade já realizada: os dados pessoais saem, e as inscrições ficam para os totais.'}
        {plan.inscricoesCanceladas > 0 &&
          ` ${plan.inscricoesCanceladas === 1 ? 'A inscrição em atividade futura é cancelada' : `As ${plan.inscricoesCanceladas} inscrições em atividades futuras são canceladas`}, e a vaga se libera.`}
      </p>
      <PlanList title="Excluído" items={plan.excluidos} />
      <PlanList title="Anonimizado" items={plan.anonimizados} />
      <PlanList title="Preservado" items={plan.preservados} />
    </div>
  );
}

/**
 * Exclusão ou anonimização a pedido do titular ou ao fim da finalidade (HU-15b): mostra o que
 * acontece com cada classe de dado antes de confirmar (CA-15b.4).
 */
export function EraseParticipantDialog({
  open,
  participant,
  onClose,
  onErased,
}: {
  open: boolean;
  participant: Participant | null;
  onClose: () => void;
  onErased: (plan: ErasurePlan) => void;
}) {
  const plan = useErasurePlan(participant?.id ?? null, open);
  const erase = useEraseParticipant();
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      form.reset({
        motivo: 'PEDIDO_TITULAR',
        canal: '' as FormValues['canal'],
        pedidoEm: todayInBrasilia(),
      });
    }
  }, [open, form]);

  function close() {
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!participant) return;
    try {
      const done = await erase.mutateAsync({
        id: participant.id,
        data: { versao: participant.versao, ...values },
      });
      close();
      onErased(done);
    } catch (error) {
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const control = form.control;
  const submitting = form.formState.isSubmitting;
  const action = plan.data?.acao === 'EXCLUIR' ? 'Excluir dados' : 'Anonimizar dados';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Excluir ou anonimizar dados</DialogTitle>
          <DialogDescription>
            {participant?.nome}: confira o que acontece com cada dado. O pedido não pode ser
            desfeito.
          </DialogDescription>
        </DialogHeader>
        {plan.isPending ? (
          <div aria-busy="true" aria-label="Carregando o resumo" className="flex flex-col gap-2">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : plan.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {failureOf(plan.error)}
          </p>
        ) : (
          <form noValidate onSubmit={onSubmit}>
            <FieldGroup>
              <PlanSummary plan={plan.data} />
              <FormField control={control} name="motivo" label="Motivo">
                {(props) => (
                  <NativeSelect {...props}>
                    {MOTIVOS_ELIMINACAO.map((motivo) => (
                      <NativeSelectOption key={motivo} value={motivo}>
                        {MOTIVO_LABEL[motivo]}
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
                <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                  Voltar
                </Button>
                <Button type="submit" variant="destructive" disabled={submitting}>
                  {submitting ? 'Registrando…' : action}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
