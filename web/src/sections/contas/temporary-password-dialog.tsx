'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TemporaryPasswordResult } from '@/types/contas';

export function TemporaryPasswordDialog({
  result,
  title,
  onClose,
}: {
  result: TemporaryPasswordResult | null;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function close() {
    setCopied(false);
    onClose();
  }

  async function copy(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={result !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Senha temporária de {result?.conta.nome}. Ela aparece só agora: entregue à pessoa por um
            canal seguro. No primeiro acesso, a troca é obrigatória.
          </DialogDescription>
        </DialogHeader>
        <p
          aria-label="Senha temporária"
          className="rounded-lg border bg-muted px-3 py-3 font-mono text-base break-all select-all"
        >
          {result?.senhaTemporaria}
        </p>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {copied ? 'Senha copiada.' : ''}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => result && copy(result.senhaTemporaria)}>
            Copiar senha
          </Button>
          <Button onClick={close}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
