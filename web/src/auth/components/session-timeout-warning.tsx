'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import {
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_WARNING_LEAD_MS,
  getLastActivityAt,
  keepSessionAlive,
  signOut,
  subscribeSessionActivity,
  syncSessionActivity,
} from '../session';

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0 && seconds > 0) return `${minutes} min ${seconds} s`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds} s`;
}

export interface SessionTimeoutDialogProps {
  open: boolean;
  remainingMs: number;
  renewing?: boolean;
  error?: string | null;
  onContinue: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutDialog({
  open,
  remainingMs,
  renewing = false,
  error = null,
  onContinue,
  onSignOut,
}: SessionTimeoutDialogProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent initialFocus={continueRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>Sua sessão vai expirar em breve</AlertDialogTitle>
          <AlertDialogDescription>
            Por segurança, a sessão encerra após 30 minutos sem uso. Restam{' '}
            {formatRemainingTime(remainingMs)} para continuar sem perder o que você está fazendo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onSignOut} disabled={renewing}>
            Sair agora
          </Button>
          <AlertDialogAction
            ref={continueRef}
            type="button"
            onClick={onContinue}
            disabled={renewing}
          >
            {renewing ? 'Renovando…' : 'Continuar conectado'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface SessionTimeoutWarningProps {
  idleTimeoutMs?: number;
  warningLeadMs?: number;
}

export function SessionTimeoutWarning({
  idleTimeoutMs = SESSION_IDLE_TIMEOUT_MS,
  warningLeadMs = SESSION_WARNING_LEAD_MS,
}: SessionTimeoutWarningProps) {
  const lastActivityAt = useSyncExternalStore(
    subscribeSessionActivity,
    getLastActivityAt,
    () => null,
  );
  const [now, setNow] = useState<number>(() => Date.now());
  const [renewing, setRenewing] = useState(false);
  // O erro vale só para o aviso em que ocorreu: nova atividade abre outro aviso, sem ele.
  const [error, setError] = useState<{ message: string; activityAt: number | null } | null>(null);
  const expiredForRef = useRef<number | null>(null);

  const deadline = lastActivityAt !== null ? lastActivityAt + idleTimeoutMs : null;
  const warnAt = deadline !== null ? deadline - warningLeadMs : null;
  const remainingMs = deadline !== null ? Math.max(0, deadline - now) : 0;
  const warningOpen = deadline !== null && warnAt !== null && now >= warnAt && now < deadline;

  useEffect(() => {
    if (lastActivityAt === null || deadline === null || warnAt === null) return;

    const expireOnce = () => {
      if (expiredForRef.current === lastActivityAt) return;
      expiredForRef.current = lastActivityAt;
      void signOut().catch(() => null);
    };

    const sync = () => {
      syncSessionActivity();
      if (getLastActivityAt() !== lastActivityAt) return;
      const current = Date.now();
      setNow(current);
      if (current >= deadline) expireOnce();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (Date.now() >= deadline) {
      expireOnce();
      return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }

    if (!warningOpen) {
      const delay = Math.max(0, warnAt - Date.now());
      const timer = setTimeout(sync, delay);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }

    const tick = setInterval(sync, 1000);
    const expireTimer = setTimeout(sync, Math.max(0, deadline - Date.now()));
    return () => {
      clearInterval(tick);
      clearTimeout(expireTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [lastActivityAt, deadline, warnAt, warningOpen]);

  async function handleContinue() {
    setRenewing(true);
    setError(null);
    try {
      await keepSessionAlive();
      setNow(Date.now());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return;
      setError({
        message: 'Não foi possível renovar a sessão. Tente novamente.',
        activityAt: getLastActivityAt(),
      });
    } finally {
      setRenewing(false);
    }
  }

  function handleSignOut() {
    setError(null);
    void signOut().catch(() => null);
  }

  if (lastActivityAt === null) return null;

  return (
    <SessionTimeoutDialog
      open={warningOpen}
      remainingMs={remainingMs}
      renewing={renewing}
      error={error?.activityAt === lastActivityAt ? error.message : null}
      onContinue={() => void handleContinue()}
      onSignOut={handleSignOut}
    />
  );
}
