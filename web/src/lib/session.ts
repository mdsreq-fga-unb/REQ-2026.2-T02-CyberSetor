import { ApiError, apiRequest, type ApiRequestOptions } from './api';

export type Perfil =
  | 'PRESIDENCIA_GESTAO'
  | 'NUCLEO_PEDAGOGICO'
  | 'ADMINISTRATIVO_FINANCEIRO'
  | 'CONCEDENTE_AUDITORIA'
  | 'ADMINISTRACAO_SISTEMA';

export interface Sessao {
  accessToken: string;
  perfil: Perfil;
  deveTrocarSenha: boolean;
}

const TRAVA_DE_RENOVACAO = 'cybersetor-renovacao';

let atual: Sessao | null = null;
let geracao = 0;
let renovando: Promise<Sessao | null> | null = null;
const ouvintes = new Set<() => void>();

function definir(sessao: Sessao | null): void {
  atual = sessao;
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function sessaoAtual(): Sessao | null {
  return atual;
}

export function assinarSessao(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function encerrarSessaoLocal(): void {
  geracao += 1;
  definir(null);
}

async function comTrava<T>(tarefa: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks ? await locks.request(TRAVA_DE_RENOVACAO, tarefa) : await tarefa();
}

async function pedirRenovacao(): Promise<Sessao | null> {
  const inicio = geracao;
  try {
    const sessao = await apiRequest<Sessao>('/auth/refresh', {
      method: 'POST',
      withSessionCookie: true,
    });
    if (inicio !== geracao) return atual;
    definir(sessao);
    return sessao;
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) {
      if (inicio === geracao) definir(null);
      return inicio === geracao ? null : atual;
    }
    throw erro;
  }
}

export function renovarSessao(): Promise<Sessao | null> {
  renovando ??= comTrava(pedirRenovacao).finally(() => {
    renovando = null;
  });
  return renovando;
}

export async function entrar(email: string, senha: string): Promise<Sessao> {
  await renovando?.catch(() => null);
  const sessao = await comTrava(() =>
    apiRequest<Sessao>('/auth/login', {
      method: 'POST',
      body: { email, senha },
      withSessionCookie: true,
    }),
  );
  geracao += 1;
  definir(sessao);
  return sessao;
}

export async function sair(): Promise<void> {
  geracao += 1;
  definir(null);
  await renovando?.catch(() => null);
  try {
    await comTrava(() =>
      apiRequest<void>('/auth/logout', { method: 'POST', withSessionCookie: true }),
    );
  } finally {
    definir(null);
  }
}

export async function requisicaoAutenticada<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'accessToken'> = {},
): Promise<T> {
  const usada = atual ?? (await renovarSessao());
  if (!usada) throw new ApiError(401, 'UNAUTHENTICATED', 'Sessão encerrada. Entre novamente.');
  try {
    return await apiRequest<T>(path, { ...options, accessToken: usada.accessToken });
  } catch (erro) {
    if (!(erro instanceof ApiError) || erro.status !== 401) throw erro;
    if (atual === null) throw erro;
    const renovada = atual.accessToken !== usada.accessToken ? atual : await renovarSessao();
    if (!renovada) throw erro;
    return apiRequest<T>(path, { ...options, accessToken: renovada.accessToken });
  }
}

export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await requisicaoAutenticada<void>('/auth/password', {
    method: 'POST',
    body: { senhaAtual, novaSenha },
  });
  if (atual) definir({ ...atual, deveTrocarSenha: false });
}
