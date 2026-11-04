import { ApiError, apiRequest, type ApiRequestOptions } from '@/lib/api';
import type { Session } from './types';

const REFRESH_LOCK = 'cybersetor-renovacao';

let current: Session | null = null;
let generation = 0;
let refreshing: Promise<Session | null> | null = null;
const listeners = new Set<() => void>();

function setCurrent(session: Session | null): void {
  current = session;
  listeners.forEach((listener) => listener());
}

export function getSession(): Session | null {
  return current;
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearLocalSession(): void {
  generation += 1;
  setCurrent(null);
}

async function withLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks ? await locks.request(REFRESH_LOCK, task) : await task();
}

async function requestRefresh(): Promise<Session | null> {
  const started = generation;
  try {
    const session = await apiRequest<Session>('/auth/refresh', {
      method: 'POST',
      withSessionCookie: true,
    });
    if (started !== generation) return current;
    setCurrent(session);
    return session;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (started === generation) setCurrent(null);
      return started === generation ? null : current;
    }
    throw error;
  }
}

export function refreshSession(): Promise<Session | null> {
  refreshing ??= withLock(requestRefresh).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function signIn(email: string, password: string): Promise<Session> {
  await refreshing?.catch(() => null);
  const session = await withLock(() =>
    apiRequest<Session>('/auth/login', {
      method: 'POST',
      body: { email, senha: password },
      withSessionCookie: true,
    }),
  );
  generation += 1;
  setCurrent(session);
  return session;
}

export async function signOut(): Promise<void> {
  clearLocalSession();
  await refreshing?.catch(() => null);
  try {
    await withLock(() =>
      apiRequest<void>('/auth/logout', { method: 'POST', withSessionCookie: true }),
    );
  } finally {
    setCurrent(null);
  }
}

export async function authorizedRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'accessToken'> = {},
): Promise<T> {
  const used = current ?? (await refreshSession());
  if (!used) throw new ApiError(401, 'UNAUTHENTICATED', 'Sessão encerrada. Entre novamente.');
  try {
    return await apiRequest<T>(path, { ...options, accessToken: used.accessToken });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (current === null) throw error;
    const refreshed = current.accessToken !== used.accessToken ? current : await refreshSession();
    if (!refreshed) throw error;
    return apiRequest<T>(path, { ...options, accessToken: refreshed.accessToken });
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await authorizedRequest<void>('/auth/password', {
    method: 'POST',
    body: { senhaAtual: currentPassword, novaSenha: newPassword },
  });
  if (current) setCurrent({ ...current, deveTrocarSenha: false });
}
