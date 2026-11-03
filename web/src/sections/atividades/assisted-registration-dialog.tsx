'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, CheckCircle2Icon, RotateCcwIcon, UserPlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { CpfField, DateField, PhoneField, TextField } from '@/components/form/fields';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { isValidCpf } from '@/lib/br';
import { usePublicForm } from '@/queries/inscricao-publica';
import { useCreateAssistedRegistration, useRegistration } from '@/queries/inscricoes';
import { checkParticipantDuplicate, type DuplicateCheckParticipant } from '@/queries/participantes';
import type { Activity } from '@/types/atividades';
import type { PublicForm } from '@/types/inscricao-publica';
import type {
  AssistedRegistrationResponse,
  CampoInscricao,
  CreateAssistedRegistrationInput,
} from '@/types/inscricoes';
import {
  Consent,
  consentsOf,
  EMPTY_REGISTRATION,
  FIELD_OF,
  guardianRule,
  isMinor,
  registrationShape,
  submissionOf,
  type RegistrationFormValues,
} from '../inscricao-publica/registration-form';

type FormValues = RegistrationFormValues & { avisoLido: boolean };

const NOTHING_ASKED: CampoInscricao[] = [];

function schemaFor(
  asked: readonly CampoInscricao[],
  hasTerm: boolean,
  reusing: DuplicateCheckParticipant | null,
) {
  return z
    .object({
      ...registrationShape(asked, hasTerm, reusing ?? undefined),
      avisoLido: z
        .boolean()
        .refine(Boolean, 'Confirme que leu o aviso de tratamento de dados para a pessoa.'),
    })
    .superRefine(guardianRule);
}

const DEFAULT_VALUES: FormValues = { ...EMPTY_REGISTRATION, avisoLido: false };

// Mesmo tom de aviso das atividades e do painel (tokens warning).
const WARNING_BOX = 'rounded-md border border-warning/60 bg-warning/10 p-3 text-sm';

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.code === 'ALREADY_REGISTERED') {
    return 'Esta pessoa já possui inscrição ativa nesta atividade.';
  }
  if (error.code === 'GUARDIAN_REQUIRED') {
    return 'O cadastro é de menor de 18 anos: informe o nome e o telefone do responsável legal.';
  }
  if ([400, 404, 409].includes(error.status)) return error.message;
  return 'Não foi possível registrar a inscrição. Tente de novo.';
}

/** Envio com cadastro reaproveitado: só o que o cadastro não tem e a atividade pede (RNF05). */
function reuseSubmission(
  values: FormValues,
  form: PublicForm,
  person: DuplicateCheckParticipant,
): CreateAssistedRegistrationInput {
  const body: CreateAssistedRegistrationInput = {
    reaproveitarParticipanteId: person.id,
    ...consentsOf(values, form),
  };
  for (const campo of form.camposAdicionais) {
    const name = FIELD_OF[campo];
    if (!person.camposDisponiveis.includes(name)) body[name] = values[name].trim();
  }
  if (values.responsavelNome.trim()) {
    body.responsavelNome = values.responsavelNome.trim();
    body.responsavelTelefone = values.responsavelTelefone;
  }
  return body;
}

/** Cadastro já existente pela chave de duplicidade da atividade, sem PII na URL (CA-08.3, RNF05). */
function useDuplicate(open: boolean, key: CampoInscricao | undefined, value: string) {
  const [found, setFound] = useState<DuplicateCheckParticipant | null>(null);
  useEffect(() => {
    if (!open || !key) return;
    const digits = value.replace(/\D/g, '');
    const email = value.trim().toLowerCase();
    const query =
      key === 'CPF' && digits.length === 11 && isValidCpf(digits)
        ? { cpf: digits }
        : key === 'EMAIL' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
          ? { email }
          : null;
    let active = true;
    const timer = setTimeout(() => {
      if (!query) return setFound(null);
      // A checagem prévia não impede a inscrição: a API recusa o repetido de qualquer forma.
      checkParticipantDuplicate(query)
        .then((res) => active && setFound(res.existe ? (res.participante ?? null) : null))
        .catch(() => undefined);
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, key, value]);
  return [found, setFound] as const;
}

/**
 * Inscrição presencial registrada pelo Núcleo (HU-08): os mesmos campos e regras do formulário
 * público, com o aviso de dados lido para a pessoa e o reaproveitamento de cadastro existente.
 */
export function AssistedRegistrationDialog({
  open,
  activity,
  onClose,
  onSuccess,
}: {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSuccess?: (res: AssistedRegistrationResponse) => void;
}) {
  const create = useCreateAssistedRegistration(activity?.id ?? '');
  const registration = useRegistration(activity?.id, open);
  const publicForm = usePublicForm(registration.data?.codigoPublico ?? '');
  const form = publicForm.data;
  const asked = form?.camposAdicionais ?? NOTHING_ASKED;
  const key = registration.data?.campoDuplicidade;
  const [reusing, setReusing] = useState<DuplicateCheckParticipant | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const termo = Boolean(form?.termo);
  const schema = useMemo(() => schemaFor(asked, termo, reusing), [asked, termo, reusing]);
  // O useForm relê as opções a cada render: o resolver acompanha o esquema atual.
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });
  const { control } = methods;
  const birthDate = useWatch({ control, name: 'dataNascimento' });
  const keyValue = useWatch({ control, name: key === 'CPF' ? 'cpf' : 'email' });
  const [duplicate, setDuplicate] = useDuplicate(open && !reusing, key, keyValue ?? '');

  const nextPosition = (activity?.inscricao?.emEspera ?? 0) + 1;
  const showsField = (campo: CampoInscricao) =>
    asked.includes(campo) && !reusing?.camposDisponiveis.includes(FIELD_OF[campo]);

  function close() {
    methods.reset(DEFAULT_VALUES);
    setReusing(null);
    setDuplicate(null);
    setFailure(null);
    onClose();
  }

  async function onValid(values: FormValues) {
    if (!form) return;
    setFailure(null);
    try {
      const response = await create.mutateAsync(
        reusing ? reuseSubmission(values, form, reusing) : submissionOf(values, form),
      );
      toast.add(
        response.situacao === 'CONFIRMADA'
          ? { type: 'success', title: `Vaga de ${response.participante.nome} confirmada` }
          : {
              type: 'info',
              title: `${response.participante.nome} entrou na lista de espera`,
              description: `Posição ${response.posicaoEspera}º.`,
            },
      );
      onSuccess?.(response);
      close();
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === 'NOTICE_OUTDATED' || error.code === 'TERM_OUTDATED')
      ) {
        methods.setValue('avisoLido', false);
        methods.setValue('aceiteTermo', false);
        void publicForm.refetch();
      }
      setFailure(failureOf(error));
    }
  }

  const submitting = methods.formState.isSubmitting;
  const minor = !reusing && isMinor(birthDate);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-5 text-primary" aria-hidden="true" />
            Inscrição presencial
          </DialogTitle>
          <DialogDescription>
            {activity?.titulo}: para quem se inscreve com a equipe, sem o link. A inscrição fica
            registrada com o seu usuário.
          </DialogDescription>
        </DialogHeader>

        {!form || !key ? (
          publicForm.isError || registration.isError ? (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível carregar a configuração da inscrição. Feche e tente de novo.
            </p>
          ) : (
            <div className="flex flex-col gap-3" aria-busy="true">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )
        ) : (
          <form noValidate onSubmit={methods.handleSubmit(onValid)} className="flex flex-col gap-5">
            {form.vagasEsgotadas && (
              <div role="status" className={`flex items-start gap-2 ${WARNING_BOX}`}>
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  {form.listaEspera ? (
                    <>
                      Vagas esgotadas: esta inscrição entra na lista de espera, na{' '}
                      <strong>{nextPosition}ª posição</strong>.
                    </>
                  ) : (
                    'Vagas esgotadas, e a atividade não tem lista de espera: a inscrição será recusada.'
                  )}
                </p>
              </div>
            )}

            <FieldGroup>
              {reusing ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/60 p-3 text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
                    Reaproveitando o cadastro de <strong>{reusing.nome}</strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12"
                    onClick={() => setReusing(null)}
                  >
                    <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                    Desfazer
                  </Button>
                </div>
              ) : (
                <>
                  <TextField control={control} name="nome" label="Nome completo" />
                  <TextField
                    control={control}
                    name="nomePreferencia"
                    label="Como prefere ser chamada (opcional)"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <PhoneField control={control} name="telefone" label="Telefone com DDD" />
                    <DateField control={control} name="dataNascimento" label="Data de nascimento" />
                  </div>
                </>
              )}

              {showsField('CPF') && <CpfField control={control} name="cpf" label="CPF" />}
              {showsField('EMAIL') && (
                <TextField control={control} name="email" type="email" label="E-mail" />
              )}

              {duplicate && !reusing && (
                <section
                  aria-label="Cadastro já existente"
                  className={`flex flex-col gap-3 ${WARNING_BOX}`}
                >
                  <p>
                    Já existe o cadastro de <strong>{duplicate.nome}</strong> (telefone{' '}
                    {duplicate.telefoneMascarado}
                    {duplicate.emailMascarado && `, e-mail ${duplicate.emailMascarado}`}
                    {duplicate.cpfMascarado && `, CPF ${duplicate.cpfMascarado}`}). Confirme com a
                    pessoa se é ela.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" className="h-12" onClick={() => setReusing(duplicate)}>
                      Reaproveitar cadastro
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12"
                      onClick={() => setDuplicate(null)}
                    >
                      Não é a mesma pessoa
                    </Button>
                  </div>
                </section>
              )}

              {showsField('BAIRRO_REGIAO') && (
                <TextField
                  control={control}
                  name="bairroRegiao"
                  label="Bairro ou região administrativa"
                />
              )}
              {showsField('ESCOLARIDADE') && (
                <TextField control={control} name="escolaridade" label="Escolaridade" />
              )}

              {(minor || reusing) && (
                <div className={`flex flex-col gap-3 ${WARNING_BOX}`}>
                  <p>
                    {reusing
                      ? 'Se a pessoa for menor de 18 anos, informe o responsável legal.'
                      : 'Menor de 18 anos: informe o responsável legal.'}
                  </p>
                  <TextField control={control} name="responsavelNome" label="Nome do responsável" />
                  <PhoneField
                    control={control}
                    name="responsavelTelefone"
                    label="Telefone do responsável com DDD"
                  />
                </div>
              )}
            </FieldGroup>

            <section aria-labelledby="aviso-presencial" className="flex flex-col gap-2">
              <h3 id="aviso-presencial" className="text-sm font-medium">
                Aviso de tratamento de dados (leia para a pessoa)
              </h3>
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                {form.aviso.texto}
              </p>
              <Consent
                name="avisoLido"
                label="Li o aviso para a pessoa ou para o responsável antes de anotar os dados"
                control={control}
              />
            </section>

            {form.termo && (
              <section aria-labelledby="termo-presencial" className="flex flex-col gap-2">
                <h3 id="termo-presencial" className="text-sm font-medium">
                  Compromissos da turma
                </h3>
                <p className="rounded-md border border-input p-3 text-sm whitespace-pre-line">
                  {form.termo.texto}
                </p>
                <Consent
                  name="aceiteTermo"
                  label="A pessoa ouviu os compromissos e concorda com todos"
                  control={control}
                />
              </section>
            )}

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Autorizações (opcionais)</legend>
              <Consent
                name="autorizaComunicados"
                label="Autoriza receber comunicados do Instituto"
                control={control}
              />
              <Consent
                name="autorizaImagem"
                label="Autoriza o uso da imagem e da voz em materiais do Instituto"
                control={control}
              />
            </fieldset>

            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-12"
                onClick={close}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-12" disabled={submitting}>
                {submitting ? 'Registrando…' : 'Concluir inscrição'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
