'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { TemporaryPasswordResult } from '@/types/contas';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_MESSAGE: Record<CopyState, string> = {
  idle: '',
  copied: 'Senha copiada.',
  failed: 'Não foi possível copiar; selecione a senha e copie manualmente.',
};

export function TemporaryPasswordDialog({
  open,
  result,
  title,
  onClose,
}: {
  open: boolean;
  result: TemporaryPasswordResult | null;
  title: string;
  onClose: () => void;
}) {
  const passwordId = useId();
  const [copy, setCopy] = useState<CopyState>('idle');

  function close() {
    setCopy('idle');
    onClose();
  }

  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Senha temporária de {result?.conta.nome}. Ela aparece só agora: entregue à pessoa por um
            canal seguro. No primeiro acesso, a troca é obrigatória.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={passwordId}>Senha temporária</FieldLabel>
          <Input
            id={passwordId}
            readOnly
            value={result?.senhaTemporaria ?? ''}
            className="font-mono"
            onFocus={(event) => event.currentTarget.select()}
          />
        </Field>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {COPY_MESSAGE[copy]}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => result && copyPassword(result.senhaTemporaria)}>
            Copiar senha
          </Button>
          <Button onClick={close}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
