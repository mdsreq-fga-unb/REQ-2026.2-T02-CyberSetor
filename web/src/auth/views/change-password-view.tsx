'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { paths } from '@/routes/paths';
import { changePassword, signOut } from '../session';

const schema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, 'Informe a senha atual.')
      .max(64, 'A senha atual tem no máximo 64 caracteres.'),
    novaSenha: z
      .string()
      .min(15, 'A nova senha precisa ter pelo menos 15 caracteres.')
      .max(64, 'A nova senha tem no máximo 64 caracteres.'),
    confirmacao: z.string().min(1, 'Repita a nova senha.'),
  })
  .refine((values) => values.confirmacao === '' || values.confirmacao === values.novaSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmacao'],
  });

type ChangePasswordValues = z.infer<typeof schema>;

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  if (error.status === 400) return error.message;
  return 'Não foi possível trocar a senha. Tente de novo.';
}

function PasswordField({
  control,
  name,
  label,
  autoComplete,
}: {
  control: Control<ChangePasswordValues>;
  name: keyof ChangePasswordValues;
  label: string;
  autoComplete: 'current-password' | 'new-password';
}) {
  const errorId = `${name}-error`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            id={name}
            type="password"
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? errorId : undefined}
          />
          {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function ChangePasswordView() {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmacao: '' },
  });
  const busy = form.formState.isSubmitting || leaving;

  async function onValid(values: ChangePasswordValues) {
    try {
      await changePassword(values.senhaAtual, values.novaSenha);
      setLeaving(true);
      router.replace(paths.dashboard.root);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setLeaving(true);
        router.replace(paths.auth.signIn);
        return;
      }
      setFailure(messageFor(error));
      if (error instanceof ApiError && error.status === 400) form.setFocus('senhaAtual');
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          <h1>Trocar senha</h1>
        </CardTitle>
        <CardDescription>
          No primeiro acesso, troque a senha temporária por uma senha só sua, com 15 a 64
          caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <PasswordField
              control={form.control}
              name="senhaAtual"
              label="Senha atual"
              autoComplete="current-password"
            />
            <PasswordField
              control={form.control}
              name="novaSenha"
              label="Nova senha"
              autoComplete="new-password"
            />
            <PasswordField
              control={form.control}
              name="confirmacao"
              label="Repita a nova senha"
              autoComplete="new-password"
            />
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <Field>
              <Button type="submit" disabled={busy}>
                {busy ? 'Trocando…' : 'Trocar senha'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  signOut().catch(() => null);
                }}
              >
                Sair
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
