'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheckIcon } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { FormField } from '@/components/form-field';
import { ListError } from '@/components/list/list-states';
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
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import {
  useFreshRegistration,
  useOpenRegistration,
  useRegistration,
  useUpdateRegistration,
} from '@/queries/inscricoes';
import type { Activity } from '@/types/atividades';
import {
  CAMPOS_ADICIONAIS,
  type CampoDuplicidade,
  type CampoInscricao,
  type Registration,
} from '@/types/inscricoes';
import { registrationLoadFailure } from './format';

const MAX_VAGAS = 10_000;
const MAX_TERMO = 4000;

const LABELS_ADICIONAIS: Record<CampoInscricao, string> = {
  CPF: 'CPF (Cadastro de Pessoas Físicas)',
  EMAIL: 'E-mail',
  BAIRRO_REGIAO: 'Bairro / Região Administrativa',
  ESCOLARIDADE: 'Escolaridade',
};

const registrationSchema = z
  .object({
    aberta: z.boolean(),
    vagas: z.coerce
      .number({ message: 'Informe o número de vagas.' })
      .int('O número de vagas deve ser um número inteiro.')
      .min(1, 'Informe ao menos 1 vaga.')
      .max(MAX_VAGAS, `O limite máximo é de ${MAX_VAGAS.toLocaleString('pt-BR')} vagas.`),
    camposAdicionais: z.array(z.enum(CAMPOS_ADICIONAIS)),
    campoDuplicidade: z.enum(['CPF', 'EMAIL']),
    termoCompromisso: z
      .string()
      .trim()
      .max(MAX_TERMO, `O texto tem no máximo ${MAX_TERMO.toLocaleString('pt-BR')} caracteres.`),
  })
  .refine((data) => data.camposAdicionais.includes(data.campoDuplicidade), {
    path: ['campoDuplicidade'],
    message:
      'O dado escolhido para evitar inscrição em dobro precisa estar entre os dados pedidos.',
  });

type FormValues = z.input<typeof registrationSchema>;
type SchemaOutput = z.output<typeof registrationSchema>;

// O formulário do Instituto pede o e-mail e não pede CPF; o repetido sai pelo e-mail.
const DEFAULT_VALUES: FormValues = {
  aberta: true,
  vagas: 30,
  camposAdicionais: ['EMAIL'],
  campoDuplicidade: 'EMAIL',
  termoCompromisso: '',
};

function valuesFromRegistration(reg: Registration | null): FormValues {
  if (!reg) return DEFAULT_VALUES;
  return {
    aberta: reg.aberta,
    vagas: reg.vagas,
    camposAdicionais: [...reg.camposAdicionais],
    campoDuplicidade: reg.campoDuplicidade,
    termoCompromisso: reg.termoCompromisso ?? '',
  };
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 409 || error.status === 400) return error.message;
  if (error.status === 403) {
    return 'O seu perfil não tem permissão para configurar a inscrição desta atividade.';
  }
  return 'Não foi possível salvar a configuração da inscrição. Tente de novo.';
}

export function RegistrationFormDialog({
  open,
  activity,
  instrumentAtivo = true,
  onClose,
  onSaved,
  onOpenShare,
}: {
  open: boolean;
  activity: Activity | null;
  instrumentAtivo?: boolean;
  onClose: () => void;
  onSaved: (registration: Registration) => void;
  onOpenShare?: (registration: Registration) => void;
}) {
  const activityId = activity?.id ?? '';
  const registrationQuery = useRegistration(activityId, open);
  const openMutation = useOpenRegistration(activityId);
  const updateMutation = useUpdateRegistration(activityId);
  const freshRegistration = useFreshRegistration();

  const [failure, setFailure] = useState<string | null>(null);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const lastActivityIdRef = useRef<string | null>(null);

  const existing = currentRegistration ?? registrationQuery.data ?? null;
  const isEditing = existing !== null;

  const form = useForm<FormValues, unknown, SchemaOutput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      lastActivityIdRef.current = null;
      return;
    }
    if (lastActivityIdRef.current !== activityId && registrationQuery.isSuccess) {
      lastActivityIdRef.current = activityId;
      setCurrentRegistration(null);
      setFailure(null);
      form.reset(valuesFromRegistration(registrationQuery.data));
    }
  }, [open, activityId, registrationQuery.isSuccess, registrationQuery.data, form]);

  function close() {
    setFailure(null);
    setCurrentRegistration(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    try {
      const latest = await freshRegistration(id);
      setCurrentRegistration(latest);
      form.reset(valuesFromRegistration(latest));
      setFailure(
        'Outra pessoa alterou esta configuração. Os campos mostram a versão atual: refaça a alteração e salve de novo.',
      );
    } catch {
      setFailure('Conflito de versão detectado. Feche e abra o diálogo novamente.');
    }
  }

  async function onValid(data: SchemaOutput) {
    try {
      let saved: Registration;
      if (existing) {
        saved = await updateMutation.mutateAsync({
          versao: existing.versao,
          aberta: data.aberta,
          vagas: data.vagas,
          camposAdicionais: data.camposAdicionais,
          campoDuplicidade: data.campoDuplicidade,
          termoCompromisso: data.termoCompromisso || null,
        });
      } else {
        saved = await openMutation.mutateAsync({
          vagas: data.vagas,
          camposAdicionais: data.camposAdicionais,
          campoDuplicidade: data.campoDuplicidade,
          ...(data.termoCompromisso && { termoCompromisso: data.termoCompromisso }),
        });
      }
      close();
      onSaved(saved);
    } catch (error) {
      if (existing && error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        await reloadAfterConflict(activityId);
        return;
      }
      if (error instanceof ApiError && error.code === 'DUPLICATE_KEY_NOT_ASKED') {
        form.setError(
          'campoDuplicidade',
          { type: 'server', message: error.message },
          { shouldFocus: true },
        );
        return;
      }
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  const isSubmitting = form.formState.isSubmitting;
  const canSave = instrumentAtivo && !isSubmitting;

  const camposAdicionaisValue =
    useWatch({
      control: form.control,
      name: 'camposAdicionais',
      defaultValue: DEFAULT_VALUES.camposAdicionais,
    }) ?? [];
  const campoDuplicidadeValue = useWatch({
    control: form.control,
    name: 'campoDuplicidade',
    defaultValue: DEFAULT_VALUES.campoDuplicidade,
  });
  const abertaValue = useWatch({
    control: form.control,
    name: 'aberta',
    defaultValue: DEFAULT_VALUES.aberta,
  });

  function handleChaveDuplicidadeChange(chave: CampoDuplicidade) {
    form.setValue('campoDuplicidade', chave, { shouldValidate: true });
    if (!camposAdicionaisValue.includes(chave)) {
      form.setValue('camposAdicionais', [...camposAdicionaisValue, chave], {
        shouldValidate: true,
      });
    }
  }

  function handleCampoAdicionalToggle(campo: CampoInscricao, checked: boolean) {
    let nextList: CampoInscricao[];
    if (checked) {
      nextList = [...camposAdicionaisValue, campo];
    } else {
      nextList = camposAdicionaisValue.filter((c) => c !== campo);
    }
    form.setValue('camposAdicionais', nextList, { shouldValidate: true });

    // Se desmarcou o campo que é a chave de duplicidade atual, dispara validação
    if (!checked && campo === campoDuplicidadeValue) {
      form.trigger('campoDuplicidade');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSubmitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar formulário de inscrição' : 'Configurar formulário de inscrição'}
          </DialogTitle>
          <DialogDescription>
            {activity
              ? `Defina as vagas e os dados pedidos no formulário de "${activity.titulo}".`
              : 'Defina as vagas e os dados pedidos no formulário.'}
          </DialogDescription>
        </DialogHeader>

        {registrationQuery.isPending ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando configuração da inscrição…
          </div>
        ) : registrationQuery.isError ? (
          <div className="flex flex-col gap-3 py-2">
            <ListError message={registrationLoadFailure(registrationQuery.error)} />
            <Button
              variant="outline"
              onClick={() => void registrationQuery.refetch()}
              className="h-12 min-h-12 self-start"
            >
              Tentar de novo
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit}>
            <FieldGroup>
              {!instrumentAtivo && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  O instrumento está inativo e não abre nem altera inscrições.
                </div>
              )}

              {/* Só na edição: a abertura já cria a inscrição aberta */}
              {isEditing && (
                <div className="rounded-lg border border-border p-4">
                  <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">Situação da inscrição</span>
                      <span className="text-sm text-muted-foreground">
                        {abertaValue
                          ? 'Formulário público aceitando novas inscrições'
                          : 'Inscrições encerradas (formulário não aceita novos envios)'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      role="switch"
                      aria-checked={abertaValue}
                      checked={abertaValue}
                      disabled={!instrumentAtivo}
                      onChange={(e) => form.setValue('aberta', e.target.checked)}
                      className="size-6 accent-primary"
                    />
                  </label>
                </div>
              )}

              {/* Vagas */}
              <FormField
                name="vagas"
                label="Número de vagas *"
                description="Limite máximo de participantes confirmados nesta atividade (1 a 10.000)."
                control={form.control}
              >
                {(props) => (
                  <Input
                    type="number"
                    min={1}
                    max={MAX_VAGAS}
                    disabled={!instrumentAtivo}
                    {...props}
                    value={props.value === undefined ? '' : String(props.value)}
                    onChange={(e) => props.onChange(e.target.value)}
                  />
                )}
              </FormField>

              {/* Campos mínimos informativos */}
              <div className="flex flex-col gap-2 rounded-lg border border-muted bg-muted/30 p-4">
                <span className="text-sm font-semibold">Sempre pedidos no formulário</span>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" checked disabled className="size-4" />
                    <span>Nome completo, nome de preferência (opcional) e telefone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" checked disabled className="size-4" />
                    <span>Data de nascimento e, para menor de 18 anos, o responsável legal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" checked disabled className="size-4" />
                    <span>
                      Aviso sobre o uso dos dados e as autorizações de comunicados e de imagem e voz
                    </span>
                  </li>
                </ul>
              </div>

              {/* Campos adicionais */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Dados a mais que esta atividade pede</span>
                <p className="text-xs text-muted-foreground">Peça só o que a atividade precisa.</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CAMPOS_ADICIONAIS.map((campo) => {
                    const isChecked = camposAdicionaisValue.includes(campo);
                    return (
                      <label
                        key={campo}
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          value={campo}
                          checked={isChecked}
                          disabled={!instrumentAtivo}
                          onChange={(e) => handleCampoAdicionalToggle(campo, e.target.checked)}
                          className="size-5 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <span>{LABELS_ADICIONAIS[campo]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Campo que identifica cadastro repetido */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Como evitar inscrição em dobro *</span>
                <p className="text-xs text-muted-foreground">
                  O sistema não aceita duas inscrições com o mesmo dado nesta atividade. O dado
                  escolhido passa a ser pedido no formulário.
                </p>
                <div
                  className="flex flex-wrap gap-4"
                  role="radiogroup"
                  aria-label="Como evitar inscrição em dobro"
                >
                  {(['CPF', 'EMAIL'] as const).map((chave) => (
                    <label
                      key={chave}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="campoDuplicidade"
                        value={chave}
                        checked={campoDuplicidadeValue === chave}
                        disabled={!instrumentAtivo}
                        onChange={() => handleChaveDuplicidadeChange(chave)}
                        className="size-5 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <span>{chave === 'CPF' ? 'Pelo CPF' : 'Pelo e-mail'}</span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.campoDuplicidade && (
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.campoDuplicidade.message}
                  </p>
                )}
              </div>

              <FormField
                name="termoCompromisso"
                label="Compromissos da turma (opcional)"
                description="Com texto, o formulário mostra os compromissos e só aceita a inscrição de quem marcar que concorda. A inscrição guarda o texto aceito."
                control={form.control}
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={4}
                    disabled={!instrumentAtivo}
                    value={props.value ?? ''}
                  />
                )}
              </FormField>

              {/* Aviso LGPD / RNF05 */}
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
                <ShieldCheckIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <strong className="block font-medium text-foreground">Proteção de dados</strong>O
                  formulário não pede raça, religião, saúde, filiação partidária nem outros dados
                  sensíveis. Só os dados da lista acima podem ser pedidos.
                </div>
              </div>

              {failure && (
                <p role="alert" className="text-sm text-destructive">
                  {failure}
                </p>
              )}
            </FieldGroup>

            <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {existing && onOpenShare && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    close();
                    onOpenShare(existing);
                  }}
                  className="h-12 min-h-12"
                >
                  Link e QR Code
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                disabled={isSubmitting}
                className="h-12 min-h-12"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSave} className="h-12 min-h-12">
                {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Abrir inscrição'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
