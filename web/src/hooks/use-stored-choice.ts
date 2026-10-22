import { useCallback, useSyncExternalStore } from 'react';

const EVENT = 'cybersetor-escolha';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useStoredChoice<T extends string>(
  key: string,
  allowed: readonly T[],
): [T | null, (value: T | null) => void] {
  const stored = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const choose = useCallback(
    (value: T | null) => {
      try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
      } catch {
        return;
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  const valid = allowed.find((option) => option === stored) ?? null;
  return [valid, choose];
}
