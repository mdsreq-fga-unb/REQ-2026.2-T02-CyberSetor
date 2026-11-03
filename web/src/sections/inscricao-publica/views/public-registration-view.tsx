'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheckIcon } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
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
import { CpfField, DateField, PhoneField, TextField } from '@/components/form/fields';
import {
  ageOn,
  formatDate,
  formatPhone,
  isValidPhone,
  nowInBrasilia,
  todayInBrasilia,
} from '@/lib/br';
import { cpfSchema, phoneSchema } from '@/lib/schemas';

const ADULT_AGE = 18;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const FIELD_OF = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
} as const satisfies Record<CampoInscricao, string>;

interface FormValues {
  nome: string;
  nomePreferencia: string;
  telefone: string;
  dataNascimento: string;
  email: string;
  cpf: string;
  bairroRegiao: string;
  escolaridade: string;
  aceiteTermo: boolean;
  autorizaComunicados: boolean;
  autorizaImagem: boolean;
  responsavelNome: string;
  responsavelTelefone: string;
}

const EMPTY: FormValues = {
  nome: '',
  nomePreferencia: '',
  telefone: '',
  dataNascimento: '',
  email: '',
  cpf: '',
  bairroRegiao: '',
  escolaridade: '',
  aceiteTermo: false,
  autorizaComunicados: false,
  autorizaImagem: false,
  responsavelNome: '',
  responsavelTelefone: '',
};

function isMinor(birthDate: string): boolean {
  return ISO_DATE.test(birthDate) && ageOn(birthDate, todayInBrasilia()) < ADULT_AGE;
}

/** Valida só os campos que a atividade pede; todos os pedidos são obrigatórios. */
function schemaFor(asked: CampoInscricao[], hasTerm: boolean) {
  const has = (campo: CampoInscricao) => asked.includes(campo);
  const required = (message: string) => z.string().trim().min(1, message);
  const optional = z.string();
  return z
    .object({
      nome: required('Informe o seu nome.').max(150, 'O nome tem no máximo 150 caracteres.'),
      nomePreferencia: z.string().max(80, 'Use no máximo 80 caracteres.'),
      telefone: phoneSchema(),
      dataNascimento: z
        .string()
        .regex(ISO_DATE, 'Informe a data de nascimento.')
        .refine((value) => value <= todayInBrasilia(), 'A data não pode ser no futuro.'),
      email: has('EMAIL')
        ? required('Informe o seu e-mail.').pipe(z.email('Informe um e-mail válido.'))
        : optional,
      cpf: has('CPF') ? cpfSchema('Informe o seu CPF.') : optional,
      bairroRegiao: has('BAIRRO_REGIAO') ? required('Informe o bairro ou a região.') : optional,
      escolaridade: has('ESCOLARIDADE') ? required('Informe a escolaridade.') : optional,
      aceiteTermo: hasTerm
        ? z.literal(true, { message: 'Marque que concorda com os compromissos da turma.' })
        : z.boolean(),
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
      if (!isValidPhone(values.responsavelTelefone)) {
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
    telefone: values.telefone,
    dataNascimento: values.dataNascimento,
    versaoAviso: form.aviso.versao,
    ...(form.termo && values.aceiteTermo && { versaoTermo: form.termo.versao }),
    autorizaComunicados: values.autorizaComunicados,
    autorizaImagem: values.autorizaImagem,
  };
  const nomePreferencia = values.nomePreferencia.trim();
  if (nomePreferencia) body.nomePreferencia = nomePreferencia;
  for (const campo of form.camposAdicionais) {
    const name = FIELD_OF[campo];
    body[name] = values[name].trim();
  }
  if (isMinor(values.dataNascimento)) {
    body.responsavelNome = values.responsavelNome.trim();
    body.responsavelTelefone = values.responsavelTelefone;
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
      {formatDate(activity.data)} · {activity.local}
    </CardDescription>
  );
}

/** "05/11/2026, às 18h" ou, sem hora, "05/11/2026, às 23h59". */
function formatDeadline(prazo: string, hora: string | null): string {
  const [h, m] = (hora ?? '23:59').split(':');
  return `${formatDate(prazo)}, às ${Number(h)}h${m === '00' ? '' : m}`;
}

function WhatsAppLink({ digits }: { digits: string }) {
  return (
    <a
      href={`https://wa.me/55${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      WhatsApp do Instituto: {formatPhone(digits)}
    </a>
  );
}

/** O que a coordenação escreveu sobre a atividade, o prazo e o contato; some quando não há. */
function Presentation({ form }: { form: PublicForm }) {
  const { apresentacao, prazoInscricao, prazoHora, contatoWhatsapp } = form;
  if (!apresentacao && !prazoInscricao && !contatoWhatsapp) return null;
  return (
    <div className="flex flex-col gap-4">
      {apresentacao && (
        <section aria-labelledby="sobre-atividade" className="flex flex-col gap-2">
          <h2 id="sobre-atividade" className="text-base font-medium">
            Sobre a atividade
          </h2>
          <p className="text-sm whitespace-pre-line">{apresentacao}</p>
        </section>
      )}
      {(prazoInscricao || contatoWhatsapp) && (
        <dl className="grid grid-cols-1 gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-2">
          {prazoInscricao && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Inscrições até</dt>
              <dd className="font-medium">{formatDeadline(prazoInscricao, prazoHora)}</dd>
            </div>
          )}
          {contatoWhatsapp && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Dúvidas</dt>
              <dd>
                <WhatsAppLink digits={contatoWhatsapp} />
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}

function deadlinePassed(form: PublicForm): boolean {
  if (!form.prazoInscricao) return false;
  return nowInBrasilia() > `${form.prazoInscricao} ${form.prazoHora ?? '23:59'}`;
}

function Message({
  title,
  text,
  activity,
  contact,
}: {
  title: string;
  text: string;
  activity?: PublicActivity;
  contact?: string | null;
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
        {contact && (
          <p className="mt-3 text-center text-sm">
            Dúvidas: <WhatsAppLink digits={contact} />
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Consent({
  name,
  label,
  control,
}: {
  name: 'aceiteTermo' | 'autorizaComunicados' | 'autorizaImagem';
  label: string;
  control: Control<FormValues>;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label
            htmlFor={name}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-input p-3 text-sm"
          >
            <input
              id={name}
              ref={field.ref}
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid || undefined}
              aria-describedby={fieldState.error ? `${name}-erro` : undefined}
              className="size-5 shrink-0 accent-primary"
            />
            <span>{label}</span>
          </label>
          {fieldState.error && (
            <p id={`${name}-erro`} className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
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
  const hasTerm = form.termo !== null;
  const schema = useMemo(
    () => schemaFor(form.camposAdicionais, hasTerm),
    [form.camposAdicionais, hasTerm],
  );
  const methods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const birthDate = useWatch({ control: methods.control, name: 'dataNascimento' });
  const minor = isMinor(birthDate);
  const asks = (campo: CampoInscricao) => form.camposAdicionais.includes(campo);

  async function onValid(values: FormValues) {
    try {
      onSubmitted(await submit.mutateAsync(submissionOf(values, form)));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'REGISTRATION_CLOSED') return onClosed();
      if (
        error instanceof ApiError &&
        (error.code === 'NOTICE_OUTDATED' || error.code === 'TERM_OUTDATED')
      ) {
        methods.setValue('aceiteTermo', false);
        onNoticeChanged();
      }
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
      <CardContent className="flex flex-col gap-6">
        <Presentation form={form} />
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <TextField name="nome" label="Nome completo" control={control} autoComplete="name" />
            <TextField
              name="nomePreferencia"
              label="Como prefere ser chamado(a)? (opcional)"
              control={control}
              autoComplete="nickname"
            />
            <PhoneField name="telefone" label="Telefone com DDD" control={control} />
            <DateField
              name="dataNascimento"
              label="Data de nascimento"
              control={control}
              autoComplete="bday"
              notFuture
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
            {asks('CPF') && <CpfField name="cpf" label="CPF" control={control} />}
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
                <PhoneField
                  name="responsavelTelefone"
                  label="Telefone do responsável com DDD"
                  control={control}
                  autoComplete="off"
                />
              </div>
            )}

            {form.termo && (
              <section aria-labelledby="termo-titulo" className="flex flex-col gap-2">
                <h2 id="termo-titulo" className="text-sm font-medium">
                  Compromissos da turma
                </h2>
                <p className="rounded-md border border-input p-3 text-sm whitespace-pre-line">
                  {form.termo.texto}
                </p>
                <Consent
                  name="aceiteTermo"
                  label="Li os compromissos acima e concordo com todos"
                  control={control}
                />
              </section>
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
                    ? 'O responsável legal autoriza o uso da imagem e da voz do participante em materiais do Instituto'
                    : 'Autorizo o uso da minha imagem e da minha voz em materiais do Instituto'
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
            {formatDate(submitted.atividade.data)} · {submitted.atividade.local}
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
    const { prazoInscricao, prazoHora } = form.data;
    return (
      <Message
        title="Inscrições encerradas"
        text={
          prazoInscricao && deadlinePassed(form.data)
            ? `O prazo de inscrição terminou em ${formatDeadline(prazoInscricao, prazoHora)}.`
            : 'Esta atividade não está recebendo inscrições no momento. Fale com a equipe do Instituto.'
        }
        activity={form.data.atividade}
        contact={form.data.contatoWhatsapp}
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
