import {
  clearLocalSession,
  signIn,
  refreshSession,
  authorizedRequest,
  signOut,
  getSession,
} from './session';

const ACCESS = { accessToken: 'token-1', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false };

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function callsTo(fetchMock: ReturnType<typeof vi.fn>, fragment: string): unknown[][] {
  return fetchMock.mock.calls.filter(([url]) => String(url).includes(fragment));
}

function expectCookie(fetchMock: ReturnType<typeof vi.fn>, fragment: string): void {
  const [, init] = callsTo(fetchMock, fragment)[0] as [string, RequestInit];
  expect(init.credentials).toBe('include');
  expect(new Headers(init.headers).get('X-CSRF')).toBe('1');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('sessao no cliente', () => {
  afterEach(() => {
    clearLocalSession();
    vi.unstubAllGlobals();
  });

  it('entrar guarda o acesso em memoria e envia o cookie de renovacao', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, ACCESS));
    vi.stubGlobal('fetch', fetchMock);

    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    expect(getSession()).toEqual(ACCESS);
    expectCookie(fetchMock, '/auth/login');
  });

  it('renovar e sair enviam o cookie e o cabecalho X-CSRF', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(200, ACCESS))
      .mockResolvedValueOnce(response(204));
    vi.stubGlobal('fetch', fetchMock);

    await refreshSession();
    await signOut();

    expectCookie(fetchMock, '/auth/refresh');
    expectCookie(fetchMock, '/auth/logout');
    expect(getSession()).toBeNull();
  });

  it('duas renovacoes simultaneas fazem uma unica requisicao', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, ACCESS));
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([refreshSession(), refreshSession()]);

    expect(a).toEqual(ACCESS);
    expect(b).toEqual(ACCESS);
    expect(callsTo(fetchMock, '/auth/refresh')).toHaveLength(1);
  });

  it('a trava entre abas impede duas renovacoes no ar ao mesmo tempo', async () => {
    let queue: Promise<unknown> = Promise.resolve();
    const request = vi.fn((_name: string, task: () => Promise<unknown>) => {
      const turn = queue.then(task);
      queue = turn.catch(() => null);
      return turn;
    });
    vi.stubGlobal('navigator', { locks: { request } });
    const first = deferred<Response>();
    const next = { ...ACCESS, accessToken: 'token-2' };
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(response(200, next));
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const tabA = await import('./session');
    vi.resetModules();
    const tabB = await import('./session');

    const refreshes = Promise.all([tabA.refreshSession(), tabB.refreshSession()]);
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    first.resolve(response(200, ACCESS));

    await expect(refreshes).resolves.toEqual([ACCESS, next]);
    expect(request).toHaveBeenCalledWith('cybersetor-renovacao', expect.any(Function));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sair espera a renovacao em andamento e so depois encerra no servidor', async () => {
    const pending = deferred<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(response(204));
    vi.stubGlobal('fetch', fetchMock);

    const refresh = refreshSession();
    const exit = signOut();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    pending.resolve(response(200, ACCESS));
    await Promise.all([refresh, exit]);

    expect(String(fetchMock.mock.calls[1][0])).toContain('/auth/logout');
    expect(getSession()).toBeNull();
  });

  it('renovacao que termina depois de encerrar a sessao e descartada', async () => {
    const pending = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(pending.promise));

    const refresh = refreshSession();
    clearLocalSession();
    pending.resolve(response(200, ACCESS));
    await refresh;

    expect(getSession()).toBeNull();
  });

  it('dois pedidos com 401 simultaneo fazem uma unica renovacao', async () => {
    const fetchMock = vi.fn((url: string, init: RequestInit) => {
      if (url.includes('/auth/login')) return Promise.resolve(response(200, ACCESS));
      if (url.includes('/auth/refresh'))
        return Promise.resolve(response(200, { ...ACCESS, accessToken: 'token-2' }));
      const authorization = new Headers(init.headers).get('Authorization');
      return Promise.resolve(
        authorization === 'Bearer token-2'
          ? response(200, { ok: true })
          : response(401, { code: 'UNAUTHENTICATED', message: 'x' }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    const results = await Promise.all([
      authorizedRequest('/accounts'),
      authorizedRequest('/accounts'),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }]);
    expect(callsTo(fetchMock, '/auth/refresh')).toHaveLength(1);
    expect(callsTo(fetchMock, '/accounts')).toHaveLength(4);
  });

  it('resposta 401 renova a sessao e repete a requisicao uma vez com o novo acesso', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(200, ACCESS))
      .mockResolvedValueOnce(response(401, { code: 'UNAUTHENTICATED', message: 'x' }))
      .mockResolvedValueOnce(response(200, { ...ACCESS, accessToken: 'token-2' }))
      .mockResolvedValueOnce(response(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await expect(authorizedRequest('/accounts')).resolves.toEqual({ ok: true });

    const [first, second] = callsTo(fetchMock, '/accounts') as [string, RequestInit][];
    expect(new Headers(first[1].headers).get('Authorization')).toBe('Bearer token-1');
    expect(new Headers(second[1].headers).get('Authorization')).toBe('Bearer token-2');
  });

  it('falha na renovacao encerra a sessao local', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(200, ACCESS))
      .mockResolvedValueOnce(response(401, { code: 'UNAUTHENTICATED', message: 'x' }))
      .mockResolvedValueOnce(response(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    vi.stubGlobal('fetch', fetchMock);
    await signIn('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await expect(authorizedRequest('/accounts')).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });
});
