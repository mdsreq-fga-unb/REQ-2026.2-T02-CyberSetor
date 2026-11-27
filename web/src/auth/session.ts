import {
  ApiError,
  apiDownload,
  apiRequest,
  type ApiDownload,
  type ApiRequestOptions,
} from '@/lib/api';
import type { Session } from './types';

const REFRESH_LOCK = 'cybersetor-renovacao';

/** Tempo de inatividade da sessão no servidor (RNF03). */
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
/**
 * Antecedência do aviso (WCAG 2.2.1): 3 min antes dos 30 min para garantir
 * pelo menos 2 min úteis mesmo considerando a janela de 60 s de escrita de
 * `ultimoUsoEm` na API.
 */
export const SESSION_WARNING_LEAD_MS = 3 * 60 * 1000;

let current: Session | null = null;
let generation = 0;
let refreshing: Promise<Session | null> | null = null;
let lastActivityAt: number | null = null;
const listeners = new Set<() => void>();
const activityListeners = new Set<() => void>();

function setCurrent(session: Session | null): void {
  current = session;
  listeners.forEach((listener) => listener());
}

/** Última atividade compartilhada entre as abas: uso em uma aba adia o aviso nas outras. */
const ACTIVITY_KEY = 'cybersetor-ultima-atividade';

function notifyActivity(): void {
  activityListeners.forEach((listener) => listener());
}

function readSharedActivity(): number | null {
  try {
    const value = Number(window.localStorage.getItem(ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function adoptActivity(value: number | null): void {
  if (lastActivityAt === null || value === null || value <= lastActivityAt) return;
  lastActivityAt = value;
  notifyActivity();
}

function markActivity(): void {
  lastActivityAt = Date.now();
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(lastActivityAt));
  } catch {
    // Sem armazenamento, a aba segue com a própria atividade.
  }
  notifyActivity();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === ACTIVITY_KEY) adoptActivity(Number(event.newValue) || null);
  });
}

/** Traz a atividade registrada por outra aba antes de decidir pelo aviso ou pela saída. */
export function syncSessionActivity(): void {
  adoptActivity(readSharedActivity());
}

function clearActivity(): void {
  if (lastActivityAt === null) return;
  lastActivityAt = null;
  notifyActivity();
}

export function getSession(): Session | null {
  return current;
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLastActivityAt(): number | null {
  return lastActivityAt;
}

export function subscribeSessionActivity(listener: () => void): () => void {
  activityListeners.add(listener);
  return () => activityListeners.delete(listener);
}

export function clearLocalSession(): void {
  generation += 1;
  clearActivity();
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
    if (lastActivityAt === null) markActivity();
    setCurrent(session);
    return session;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (started === generation) {
        clearActivity();
        setCurrent(null);
      }
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
  markActivity();
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
    clearActivity();
    setCurrent(null);
  }
}

async function withAccessToken<T>(run: (accessToken: string) => Promise<T>): Promise<T> {
  const used = current ?? (await refreshSession());
  if (!used) throw new ApiError(401, 'UNAUTHENTICATED', 'Sessão encerrada. Entre novamente.');
  try {
    const result = await run(used.accessToken);
    markActivity();
    return result;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (current === null) throw error;
    const refreshed = current.accessToken !== used.accessToken ? current : await refreshSession();
    if (!refreshed) throw error;
    const result = await run(refreshed.accessToken);
    markActivity();
    return result;
  }
}

export function authorizedRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'accessToken'> = {},
): Promise<T> {
  return withAccessToken((accessToken) => apiRequest<T>(path, { ...options, accessToken }));
}

export function authorizedDownload(path: string): Promise<ApiDownload> {
  return withAccessToken((accessToken) => apiDownload(path, { accessToken }));
}

/** Renova o registro de atividade da sessão no servidor sem desmontar a tela atual. */
export async function keepSessionAlive(): Promise<void> {
  await authorizedRequest('/auth/session');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await authorizedRequest<void>('/auth/password', {
    method: 'POST',
    body: { senhaAtual: currentPassword, novaSenha: newPassword },
  });
  if (current) setCurrent({ ...current, deveTrocarSenha: false });
}
