'use client';

import { useState, type FormEvent } from 'react';
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
import { ApiError } from '@/lib/api';
import { useChangeSector, useFreshAccount } from '@/queries/contas';
import { useSectors } from '@/queries/setores';
import type { Account } from '@/types/contas';
import { errorMessage } from './error-message';

export function ChangeSectorDialog({
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
  const changeSector = useChangeSector();
  const freshAccount = useFreshAccount();
  const sectors = useSectors(open);
  const [fresh, setFresh] = useState<Account | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const shown = fresh ?? account;
  const current = shown?.setor?.id ?? '';
  const setorId = chosen ?? current;
  const options = sectors.data?.filter((sector) => sector.ativo || sector.id === current) ?? [];

  function close() {
    setFresh(null);
    setChosen(null);
    setFailure(null);
    onClose();
  }

  async function reloadAfterConflict(id: string) {
    const latest = await freshAccount(id).catch(() => null);
    if (!latest) {
      setFailure('A conta não foi encontrada. Feche e confira a lista.');
      return;
    }
    setFresh(latest);
    setChosen(null);
    setFailure(
      'Outra pessoa alterou esta conta. O formulário mostra a versão atual: refaça a sua alteração e salve de novo.',
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shown) return;
    if (setorId === current) return close();
    setFailure(null);
    try {
      const updated = await changeSector.mutateAsync({
        id: shown.id,
        setorId: setorId || null,
        versao: shown.versao,
      });
      close();
      onChanged(updated);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
        await reloadAfterConflict(shown.id);
        return;
      }
      setFailure(errorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !changeSector.isPending && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mudar setor</DialogTitle>
          <DialogDescription>
            Setor de {shown?.nome} na equipe. Não muda o que a pessoa pode fazer.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="novo-setor">Setor</FieldLabel>
              <NativeSelect
                id="novo-setor"
                value={setorId}
                disabled={!sectors.isSuccess}
                onChange={(event) => setChosen(event.target.value)}
              >
                <NativeSelectOption value="">
                  {sectors.isPending ? 'Carregando…' : 'Sem setor'}
                </NativeSelectOption>
                {options.map((sector) => (
                  <NativeSelectOption key={sector.id} value={sector.id} disabled={!sector.ativo}>
                    {sector.nome}
                    {sector.ativo ? '' : ' (inativo)'}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {sectors.isError && (
              <p role="alert" className="text-sm text-destructive">
                Não foi possível carregar os setores. Feche e tente de novo.
              </p>
            )}
            {failure && (
              <p role="alert" className="text-sm text-destructive">
                {failure}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={changeSector.isPending || !sectors.isSuccess}>
                {changeSector.isPending ? 'Salvando…' : 'Salvar setor'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
