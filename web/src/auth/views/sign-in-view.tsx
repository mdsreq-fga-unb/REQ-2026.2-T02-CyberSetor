'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { paths } from '@/routes/paths';
import { signIn } from '../session';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .max(254, 'O e-mail tem no máximo 254 caracteres.')
    .pipe(z.email('Informe um e-mail válido.')),
  senha: z.string().min(1, 'Informe a senha.').max(64, 'A senha tem no máximo 64 caracteres.'),
});

type SignInValues = z.infer<typeof schema>;

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível falar com o servidor. Tente de novo.';
  if (error.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  if (error.status === 401) return error.message;
  return 'Não foi possível entrar. Tente de novo.';
}

export function SignInView() {
  const router = useRouter();
  const [failure, setFailure] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '' },
  });
  const busy = form.formState.isSubmitting || leaving;

  async function onValid(values: SignInValues) {
    try {
      const session = await signIn(values.email, values.senha);
      setLeaving(true);
      router.replace(session.deveTrocarSenha ? paths.auth.changePassword : paths.dashboard.root);
    } catch (error) {
      setFailure(messageFor(error));
      form.setFocus('senha');
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
          <h1>Entrar</h1>
        </CardTitle>
        <CardDescription>Use o e-mail e a senha da sua conta no Instituto.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'email-error' : undefined}
                  />
                  {fieldState.invalid && (
                    <FieldError id="email-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="senha"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="senha">Senha</FieldLabel>
                  <Input
                    {...field}
                    id="senha"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'senha-error' : undefined}
                  />
                  {fieldState.invalid && (
                    <FieldError id="senha-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <Field>
              <Button type="submit" disabled={busy}>
                {busy ? 'Entrando…' : 'Entrar'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
