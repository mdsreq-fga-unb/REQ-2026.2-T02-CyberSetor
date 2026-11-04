import { useCallback, useSyncExternalStore } from 'react';

const EVENT = 'hashchange';

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * Aba guardada no endereço (`#relatorios`): recarregar a página ou mandar o link abre a mesma aba.
 * A primeira da lista é a padrão e não aparece no endereço.
 */
export function useHashTab<T extends string>(tabs: readonly [T, ...T[]]): [T, (tab: T) => void] {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1),
    () => '',
  );
  const [standard] = tabs;
  const current = tabs.includes(hash as T) ? (hash as T) : standard;
  const choose = useCallback(
    (tab: T) => {
      const { pathname, search } = window.location;
      const suffix = tab === standard ? '' : `#${tab}`;
      window.history.replaceState(null, '', `${pathname}${search}${suffix}`);
      window.dispatchEvent(new HashChangeEvent(EVENT));
    },
    [standard],
  );
  return [current, choose];
}
