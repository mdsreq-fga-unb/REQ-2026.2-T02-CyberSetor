'use client';

import { useCallback, useState } from 'react';

export interface DialogState<T> {
  open: boolean;
  value: T | null;
  show: (value: T) => void;
  close: () => void;
}

export function useDialogState<T>(): DialogState<T> {
  const [state, setState] = useState<{ open: boolean; value: T | null }>({
    open: false,
    value: null,
  });
  const show = useCallback((value: T) => setState({ open: true, value }), []);
  const close = useCallback(() => setState((previous) => ({ ...previous, open: false })), []);
  return { ...state, show, close };
}
