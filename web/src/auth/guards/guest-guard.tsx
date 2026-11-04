'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { paths } from '@/routes/paths';
import { useSession } from '../hooks/use-session';
import { SessionLoading } from './session-loading';

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, session } = useSession();

  useEffect(() => {
    if (session) {
      router.replace(session.deveTrocarSenha ? paths.auth.changePassword : paths.dashboard.root);
    }
  }, [session, router]);

  if (status !== 'unauthenticated') return <SessionLoading />;
  return children;
}
