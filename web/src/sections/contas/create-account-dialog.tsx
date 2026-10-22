'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PROFILES, profileLabel } from '@/auth/profiles';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useCreateAccount } from '@/queries/contas';
import { useSectors } from '@/queries/setores';
import type { TemporaryPasswordResult } from '@/types/contas';
import { errorMessage } from './error-message';

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome.')
    .max(200, 'O nome tem no máximo 200 caracteres.'),
  emailLogin: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .max(254, 'O e-mail tem no máximo 254 caracteres.')
    .pipe(z.email('Informe um e-mail válido.')),
  perfil: z.enum(PROFILES, 'Escolha o perfil.'),
  setorId: z.string().transform((value) => value || undefined),
});

type CreateAccountValues = z.input<typeof schema>;

const EMPTY = {
  nome: '',
  emailLogin: '',
  perfil: '',
  setorId: '',
} as unknown as CreateAccountValues;

export function CreateAccountDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: TemporaryPasswordResult) => void;
}) {
  const createAccount = useCreateAccount();
  const sectors = useSectors(open);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm<CreateAccountValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  function change(next: boolean) {
    if (!next) {
      form.reset(EMPTY);
      setFailure(null);
    }
    onOpenChange(next);
  }

  async function onValid(values: z.output<typeof schema>) {
    try {
      const result = await createAccount.mutateAsync(values);
      change(false);
      onCreated(result);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setFailure(null);
    return form.handleSubmit(onValid)(event);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next || !form.formState.isSubmitting) && change(next)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta</DialogTitle>
          <DialogDescription>
            A pessoa recebe uma senha temporária e troca a senha no primeiro acesso.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="nome"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                    {...field}
                    id="nome"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'nome-error' : undefined}
                  />
                  {fieldState.invalid && <FieldError id="nome-error" errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="emailLogin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="emailLogin">E-mail de acesso</FieldLabel>
                  <Input
                    {...field}
                    id="emailLogin"
                    type="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'emailLogin-error' : undefined}
                  />
                  {fieldState.invalid && (
                    <FieldError id="emailLogin-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="perfil"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="perfil">Perfil</FieldLabel>
                  <NativeSelect
                    {...field}
                    id="perfil"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'perfil-error' : undefined}
                  >
                    <NativeSelectOption value="" disabled>
                      Escolha o perfil
                    </NativeSelectOption>
                    {PROFILES.map((perfil) => (
                      <NativeSelectOption key={perfil} value={perfil}>
                        {profileLabel(perfil)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {fieldState.invalid && (
                    <FieldError id="perfil-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="setorId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="setorId">Setor (opcional)</FieldLabel>
                  <NativeSelect {...field} id="setorId" disabled={sectors.isPending}>
                    <NativeSelectOption value="">
                      {sectors.isPending ? 'Carregando…' : 'Sem setor'}
                    </NativeSelectOption>
                    {sectors.data
                      ?.filter((sector) => sector.ativo)
                      .map((sector) => (
                        <NativeSelectOption key={sector.id} value={sector.id}>
                          {sector.nome}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                </Field>
              )}
            />
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Criando…' : 'Criar conta'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
