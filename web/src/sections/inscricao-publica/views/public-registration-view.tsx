'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheckIcon } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { usePublicForm, useSubmitRegistration } from '@/queries/inscricao-publica';
import type {
  PublicActivity,
  PublicForm,
  PublicSubmission,
  SubmittedRegistration,
} from '@/types/inscricao-publica';
import type { CampoInscricao } from '@/types/inscricoes';
import {
  ageOn,
  formatDateBr,
  isValidCpf,
  onlyDigits,
  phoneDigits,
  todayInBrasilia,
} from '../participant-data';

const ADULT_AGE = 18;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const phone = (message: string) =>
  z.string().refine((value) => /^\d{10,11}$/.test(phoneDigits(value)), message);

const FIELD_OF = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
} as const satisfies Record<CampoInscricao, string>;

interface FormValues {
  nome: string;
  telefone: string;
  dataNascimento: string;
  email: string;
  cpf: string;
  bairroRegiao: string;
  escolaridade: string;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  responsavelNome: string;
  responsavelTelefone: string;
}

type FieldName = keyof FormValues;

const EMPTY: FormValues = {
  nome: '',
  telefone: '',
  dataNascimento: '',
  email: '',
  cpf: '',
  bairroRegiao: '',
  escolaridade: '',
  autorizaComunicados: false,
  autorizaImagem: false,
  responsavelNome: '',
  responsavelTelefone: '',
};

function isMinor(birthDate: string): boolean {
  return ISO_DATE.test(birthDate) && ageOn(birthDate, todayInBrasilia()) < ADULT_AGE;
}

/** Valida só os campos que a atividade pede; todos os pedidos são obrigatórios. */
function schemaFor(asked: CampoInscricao[]) {
  const has = (campo: CampoInscricao) => asked.includes(campo);
  const required = (message: string) => z.string().trim().min(1, message);
  const optional = z.string();
  return z
    .object({
      nome: required('Informe o seu nome.').max(150, 'O nome tem no máximo 150 caracteres.'),
      telefone: phone('Informe o telefone com DDD, como (61) 99999-8888.'),
      dataNascimento: z
        .string()
        .regex(ISO_DATE, 'Informe a data de nascimento.')
        .refine((value) => value <= todayInBrasilia(), 'A data não pode ser no futuro.'),
      email: has('EMAIL')
        ? required('Informe o seu e-mail.').pipe(z.email('Informe um e-mail válido.'))
        : optional,
      cpf: has('CPF')
        ? required('Informe o seu CPF.').refine(isValidCpf, 'CPF inválido. Confira os números.')
        : optional,
      bairroRegiao: has('BAIRRO_REGIAO') ? required('Informe o bairro ou a região.') : optional,
      escolaridade: has('ESCOLARIDADE') ? required('Informe a escolaridade.') : optional,
      autorizaComunicados: z.boolean(),
      autorizaImagem: z.boolean(),
      responsavelNome: optional,
      responsavelTelefone: optional,
    })
    .superRefine((values, ctx) => {
      if (!isMinor(values.dataNascimento)) return;
      if (values.responsavelNome.trim().length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['responsavelNome'],
          message: 'Informe o nome do responsável legal.',
        });
      }
      if (!/^\d{10,11}$/.test(phoneDigits(values.responsavelTelefone))) {
        ctx.addIssue({
          code: 'custom',
          path: ['responsavelTelefone'],
          message: 'Informe o telefone do responsável com DDD.',
        });
      }
    });
}

/** Monta o envio só com o que a atividade pede, para não coletar dado a mais (RNF05). */
function submissionOf(values: FormValues, form: PublicForm): PublicSubmission {
  const body: PublicSubmission = {
    nome: values.nome.trim(),
    telefone: phoneDigits(values.telefone),
    dataNascimento: values.dataNascimento,
    versaoAviso: form.aviso.versao,
    autorizaComunicados: values.autorizaComunicados,
    autorizaImagem: values.autorizaImagem,
  };
  for (const campo of form.camposAdicionais) {
    const name = FIELD_OF[campo];
    body[name] = name === 'cpf' ? onlyDigits(values.cpf) : values[name].trim();
  }
  if (isMinor(values.dataNascimento)) {
    body.responsavelNome = values.responsavelNome.trim();
    body.responsavelTelefone = phoneDigits(values.responsavelTelefone);
  }
  return body;
}

function failureOf(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 429) return 'Muitos envios seguidos. Aguarde um minuto e tente de novo.';
  if (error.status === 400 || error.status === 409) return error.message;
  return 'Não foi possível enviar a inscrição. Tente de novo.';
}

function ActivitySummary({ activity }: { activity: PublicActivity }) {
  return (
    <CardDescription>
      {formatDateBr(activity.data)} · {activity.local}
    </CardDescription>
  );
}

function Message({
  title,
  text,
  activity,
}: {
  title: string;
  text: string;
  activity?: PublicActivity;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          <h1>{title}</h1>
        </CardTitle>
        {activity && <ActivitySummary activity={activity} />}
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function TextField({
  name,
  label,
  control,
  type = 'text',
  inputMode,
  autoComplete,
  hint,
}: {
  name: FieldName;
  label: string;
  control: Control<FormValues>;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            value={String(field.value)}
            id={name}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            className="h-12"
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${name}-error` : hint ? `${name}-hint` : undefined
            }
          />
          {hint && !fieldState.invalid && (
            <p id={`${name}-hint`} className="text-xs text-muted-foreground">
              {hint}
            </p>
          )}
          {fieldState.invalid && <FieldError id={`${name}-error`} errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function Consent({
  name,
  label,
  control,
}: {
  name: 'autorizaComunicados' | 'autorizaImagem';
  label: string;
  control: Control<FormValues>;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label
          htmlFor={name}
          className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm"
        >
          <input
            id={name}
            type="checkbox"
            checked={field.value}
            onChange={(event) => field.onChange(event.target.checked)}
            onBlur={field.onBlur}
            className="size-5 shrink-0 accent-primary"
          />
          <span>{label}</span>
        </label>
      )}
    />
  );
}

function RegistrationForm({
  form,
  codigo,
  onSubmitted,
  onClosed,
  onNoticeChanged,
}: {
  form: PublicForm;
  codigo: string;
  onSubmitted: (result: SubmittedRegistration) => void;
  onClosed: () => void;
  onNoticeChanged: () => void;
}) {
  const submit = useSubmitRegistration(codigo);
  const [failure, setFailure] = useState<string | null>(null);
  const schema = useMemo(() => schemaFor(form.camposAdicionais), [form.camposAdicionais]);
  const methods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const birthDate = useWatch({ control: methods.control, name: 'dataNascimento' });
  const minor = isMinor(birthDate);
  const asks = (campo: CampoInscricao) => form.camposAdicionais.includes(campo);

  async function onValid(values: FormValues) {
    try {
      onSubmitted(await submit.mutateAsync(submissionOf(values, form)));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'REGISTRATION_CLOSED') return onClosed();
      if (error instanceof ApiError && error.code === 'NOTICE_OUTDATED') onNoticeChanged();
      setFailure(failureOf(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return methods.handleSubmit(onValid)(event);
  }

  const busy = methods.formState.isSubmitting;
  const control = methods.control;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          <h1>Inscrição: {form.atividade.titulo}</h1>
        </CardTitle>
        <ActivitySummary activity={form.atividade} />
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <TextField name="nome" label="Nome completo" control={control} autoComplete="name" />
            <TextField
              name="telefone"
              label="Telefone com DDD"
              control={control}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              hint="Exemplo: (61) 99999-8888"
            />
            <TextField
              name="dataNascimento"
              label="Data de nascimento"
              control={control}
              type="date"
              autoComplete="bday"
            />
            {asks('EMAIL') && (
              <TextField
                name="email"
                label="E-mail"
                control={control}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            )}
            {asks('CPF') && (
              <TextField
                name="cpf"
                label="CPF"
                control={control}
                inputMode="numeric"
                hint="Só os números ou com pontos e traço"
              />
            )}
            {asks('BAIRRO_REGIAO') && (
              <TextField name="bairroRegiao" label="Bairro ou região" control={control} />
            )}
            {asks('ESCOLARIDADE') && (
              <TextField name="escolaridade" label="Escolaridade" control={control} />
            )}

            {minor && (
              <div className="flex flex-col gap-4 rounded-md border border-input p-3">
                <p className="text-sm font-medium">
                  Responsável legal (obrigatório para menores de 18 anos)
                </p>
                <TextField name="responsavelNome" label="Nome do responsável" control={control} />
                <TextField
                  name="responsavelTelefone"
                  label="Telefone do responsável com DDD"
                  control={control}
                  type="tel"
                  inputMode="tel"
                />
              </div>
            )}

            <section
              aria-labelledby="aviso-titulo"
              className="flex flex-col gap-2 rounded-md bg-muted p-3"
            >
              <h2 id="aviso-titulo" className="text-sm font-medium">
                Como usamos os seus dados
              </h2>
              <p className="text-sm text-muted-foreground">{form.aviso.texto}</p>
            </section>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Autorizações (opcionais)</legend>
              <Consent
                name="autorizaComunicados"
                label={
                  minor
                    ? 'O responsável legal autoriza o envio de comunicados do Instituto'
                    : 'Quero receber comunicados do Instituto'
                }
                control={control}
              />
              <Consent
                name="autorizaImagem"
                label={
                  minor
                    ? 'O responsável legal autoriza o uso da imagem do participante em materiais do Instituto'
                    : 'Autorizo o uso da minha imagem em materiais do Instituto'
                }
                control={control}
              />
            </fieldset>

            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <Field>
              <Button type="submit" className="h-12" disabled={busy}>
                {busy ? 'Enviando…' : 'Confirmar inscrição'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export function PublicRegistrationView({ codigo }: { codigo: string }) {
  const form = usePublicForm(codigo);
  const [submitted, setSubmitted] = useState<SubmittedRegistration | null>(null);
  const [closed, setClosed] = useState(false);

  if (submitted) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CircleCheckIcon aria-hidden="true" className="size-10 text-primary" />
          <CardTitle className="text-xl">
            <h1>Inscrição confirmada</h1>
          </CardTitle>
          <CardDescription>{submitted.atividade.titulo}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-center text-sm">
          <p>
            {formatDateBr(submitted.atividade.data)} · {submitted.atividade.local}
          </p>
          <p className="text-muted-foreground">
            Se tiver dúvidas ou quiser cancelar, fale com a equipe do Instituto.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (form.isPending) {
    return (
      <Card aria-busy="true" aria-label="Carregando o formulário">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Com o formulário já carregado, uma recarga que falha não apaga o que foi digitado.
  if (!form.data) {
    const notFound = form.error instanceof ApiError && form.error.status === 404;
    return notFound ? (
      <Message
        title="Link de inscrição inválido"
        text="Confira o endereço com a equipe do Instituto."
      />
    ) : (
      <Message
        title="Não foi possível abrir o formulário"
        text="Verifique a sua conexão e tente de novo em instantes."
      />
    );
  }

  if (closed || !form.data.aberta) {
    return (
      <Message
        title="Inscrições encerradas"
        text="Esta atividade não está recebendo inscrições no momento. Fale com a equipe do Instituto."
        activity={form.data.atividade}
      />
    );
  }

  return (
    <RegistrationForm
      form={form.data}
      codigo={codigo}
      onSubmitted={setSubmitted}
      onClosed={() => setClosed(true)}
      onNoticeChanged={() => void form.refetch()}
    />
  );
}
