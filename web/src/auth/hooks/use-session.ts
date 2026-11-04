'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSession, refreshSession, subscribeSession } from '../session';
import type { Session } from '../types';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useSession(): { status: SessionStatus; session: Session | null } {
  const session = useSyncExternalStore(subscribeSession, getSession, () => null);
  const [checked, setChecked] = useState(() => getSession() !== null);

  useEffect(() => {
    if (checked) return;
    let active = true;
    refreshSession()
      .catch(() => null)
      .finally(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, [checked]);

  if (session) return { status: 'authenticated', session };
  return { status: checked ? 'unauthenticated' : 'loading', session: null };
}
