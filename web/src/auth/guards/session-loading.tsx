'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/** Depois deste tempo em "Carregando…", a tela diz o que fazer em vez de esperar calada (RNF15, #329). */
export const SLOW_LOADING_MS = 15_000;

export function SessionLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!slow) {
    return (
      <p role="status" className="p-6 text-sm text-muted-foreground">
        Carregando…
      </p>
    );
  }

  return (
    <div role="alert" className="flex flex-col items-start gap-3 p-6 text-sm">
      <p>
        O carregamento está demorando mais que o normal. Confira a conexão com a internet e tente de
        novo.
      </p>
      <Button type="button" onClick={() => window.location.reload()}>
        Tentar de novo
      </Button>
    </div>
  );
}
