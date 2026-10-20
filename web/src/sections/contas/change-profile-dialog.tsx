'use client';

import { useState, type FormEvent } from 'react';
import { PROFILES, profileLabel } from '@/auth/profiles';
import type { Perfil } from '@/auth/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useChangeProfile } from '@/queries/contas';
import type { Account } from '@/types/contas';
import { errorMessage } from './error-message';

export function ChangeProfileDialog({
  open,
  account,
  onClose,
  onChanged,
}: {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onChanged: (account: Account) => void;
}) {
  const changeProfile = useChangeProfile();
  const [chosen, setChosen] = useState<Perfil | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const perfil = chosen ?? account?.perfil ?? PROFILES[0];

  function close() {
    setChosen(null);
    setFailure(null);
    onClose();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    if (perfil === account.perfil) return close();
    setFailure(null);
    try {
      const updated = await changeProfile.mutateAsync({ id: account.id, perfil });
      close();
      onChanged(updated);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !changeProfile.isPending && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mudar perfil</DialogTitle>
          <DialogDescription>
            O novo perfil de {account?.nome} vale a partir da próxima ação da pessoa.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="novo-perfil">Perfil</FieldLabel>
              <NativeSelect
                id="novo-perfil"
                value={perfil}
                onChange={(event) => setChosen(event.target.value as Perfil)}
              >
                {PROFILES.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {profileLabel(option)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={changeProfile.isPending}>
                {changeProfile.isPending ? 'Salvando…' : 'Salvar perfil'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
