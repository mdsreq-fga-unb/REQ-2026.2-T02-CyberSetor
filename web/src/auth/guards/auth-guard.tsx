'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { paths } from '@/routes/paths';
import { useSession } from '../hooks/use-session';
import { SessionLoading } from './session-loading';

export function AuthGuard({
  children,
  allowPendingPasswordChange = false,
}: {
  children: ReactNode;
  allowPendingPasswordChange?: boolean;
}) {
  const router = useRouter();
  const { status, session } = useSession();
  const mustChangePassword = session?.deveTrocarSenha === true && !allowPendingPasswordChange;

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(paths.auth.signIn);
    else if (mustChangePassword) router.replace(paths.auth.changePassword);
  }, [status, mustChangePassword, router]);

  if (status !== 'authenticated' || mustChangePassword) return <SessionLoading />;
  return children;
}
