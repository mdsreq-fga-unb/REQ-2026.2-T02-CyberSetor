import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { ageOn, isValidPhone, todayInBrasilia } from '@/lib/br';
import { cpfSchema, ISO_DATE, phoneSchema } from '@/lib/schemas';
import type { PublicForm, PublicSubmission } from '@/types/inscricao-publica';
import type { CampoInscricao } from '@/types/inscricoes';

/**
 * Campos e regras da inscrição, comuns ao formulário público (HU-07a) e à inscrição presencial
 * registrada pelo Núcleo (HU-08): os dois pedem os mesmos dados e mandam o mesmo envio.
 */

const ADULT_AGE = 18;

export const FIELD_OF = {
  EMAIL: 'email',
  CPF: 'cpf',
  BAIRRO_REGIAO: 'bairroRegiao',
  ESCOLARIDADE: 'escolaridade',
} as const satisfies Record<CampoInscricao, string>;

export interface RegistrationFormValues {
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

export const EMPTY_REGISTRATION: RegistrationFormValues = {
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

export function isMinor(birthDate: string): boolean {
  return ISO_DATE.test(birthDate) && ageOn(birthDate, todayInBrasilia()) < ADULT_AGE;
}

/**
 * Campos do formulário. Só os que a atividade pede são validados, e todos os pedidos são
 * obrigatórios. Com `reused`, os dados pessoais vêm do cadastro existente: só os campos pedidos que
 * o cadastro não tem são preenchidos aqui.
 */
export function registrationShape(
  asked: readonly CampoInscricao[],
  hasTerm: boolean,
  reused?: { camposDisponiveis: readonly string[] },
) {
  const needs = (campo: CampoInscricao) =>
    asked.includes(campo) && !reused?.camposDisponiveis.includes(FIELD_OF[campo]);
  const required = (message: string) => z.string().trim().min(1, message);
  const optional = z.string();
  return {
    nome: reused
      ? optional
      : required('Informe o seu nome.').max(150, 'O nome tem no máximo 150 caracteres.'),
    nomePreferencia: z.string().max(80, 'Use no máximo 80 caracteres.'),
    telefone: reused ? optional : phoneSchema(),
    dataNascimento: reused
      ? optional
      : z
          .string()
          .regex(ISO_DATE, 'Informe a data de nascimento.')
          .refine((value) => value <= todayInBrasilia(), 'A data não pode ser no futuro.'),
    email: needs('EMAIL')
      ? required('Informe o seu e-mail.').pipe(z.email('Informe um e-mail válido.'))
      : optional,
    cpf: needs('CPF') ? cpfSchema('Informe o seu CPF.') : optional,
    bairroRegiao: needs('BAIRRO_REGIAO') ? required('Informe o bairro ou a região.') : optional,
    escolaridade: needs('ESCOLARIDADE') ? required('Informe a escolaridade.') : optional,
    aceiteTermo: hasTerm
      ? z.literal(true, { message: 'Marque que concorda com os compromissos da turma.' })
      : z.boolean(),
    autorizaComunicados: z.boolean(),
    autorizaImagem: z.boolean(),
    responsavelNome: optional,
    responsavelTelefone: optional,
  };
}

/** Menor de 18 anos exige o responsável legal (RN-06). */
export function guardianRule(values: RegistrationFormValues, ctx: z.RefinementCtx): void {
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
}

/** Monta o envio só com o que a atividade pede, para não coletar dado a mais (RNF05). */
export function submissionOf(values: RegistrationFormValues, form: PublicForm): PublicSubmission {
  const body: PublicSubmission = {
    nome: values.nome.trim(),
    telefone: values.telefone,
    dataNascimento: values.dataNascimento,
    ...consentsOf(values, form),
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

/** Aviso apresentado, aceite dos compromissos com a versão do texto e autorizações. */
export function consentsOf(values: RegistrationFormValues, form: PublicForm) {
  return {
    versaoAviso: form.aviso.versao,
    ...(form.termo && values.aceiteTermo && { versaoTermo: form.termo.versao }),
    autorizaComunicados: values.autorizaComunicados,
    autorizaImagem: values.autorizaImagem,
  };
}

/** Caixa de marcar com o alvo de toque de 48 px (RNF15) e o erro ligado ao campo. */
export function Consent<T extends FieldValues>({
  name,
  label,
  control,
}: {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
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
              checked={Boolean(field.value)}
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
