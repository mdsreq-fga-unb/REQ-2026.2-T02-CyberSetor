import {
  encerrarSessaoLocal,
  entrar,
  renovarSessao,
  requisicaoAutenticada,
  sair,
  sessaoAtual,
} from './session';

const ACESSO = { accessToken: 'token-1', perfil: 'PRESIDENCIA_GESTAO', deveTrocarSenha: false };

function resposta(status: number, corpo?: unknown): Response {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), { status });
}

function chamadas(fetchMock: ReturnType<typeof vi.fn>, trecho: string): unknown[][] {
  return fetchMock.mock.calls.filter(([url]) => String(url).includes(trecho));
}

function esperaCookie(fetchMock: ReturnType<typeof vi.fn>, trecho: string): void {
  const [, init] = chamadas(fetchMock, trecho)[0] as [string, RequestInit];
  expect(init.credentials).toBe('include');
  expect(new Headers(init.headers).get('X-CSRF')).toBe('1');
}

function adiada<T>(): { promessa: Promise<T>; resolver: (valor: T) => void } {
  let resolver!: (valor: T) => void;
  const promessa = new Promise<T>((r) => {
    resolver = r;
  });
  return { promessa, resolver };
}

describe('sessao no cliente', () => {
  afterEach(() => {
    encerrarSessaoLocal();
    vi.unstubAllGlobals();
  });

  it('entrar guarda o acesso em memoria e envia o cookie de renovacao', async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta(200, ACESSO));
    vi.stubGlobal('fetch', fetchMock);

    await entrar('pessoa@instituto.org.br', 'senha-de-teste-longa');

    expect(sessaoAtual()).toEqual(ACESSO);
    esperaCookie(fetchMock, '/auth/login');
  });

  it('renovar e sair enviam o cookie e o cabecalho X-CSRF', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(resposta(200, ACESSO))
      .mockResolvedValueOnce(resposta(204));
    vi.stubGlobal('fetch', fetchMock);

    await renovarSessao();
    await sair();

    esperaCookie(fetchMock, '/auth/refresh');
    esperaCookie(fetchMock, '/auth/logout');
    expect(sessaoAtual()).toBeNull();
  });

  it('duas renovacoes simultaneas fazem uma unica requisicao', async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta(200, ACESSO));
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([renovarSessao(), renovarSessao()]);

    expect(a).toEqual(ACESSO);
    expect(b).toEqual(ACESSO);
    expect(chamadas(fetchMock, '/auth/refresh')).toHaveLength(1);
  });

  it('a trava entre abas impede duas renovacoes no ar ao mesmo tempo', async () => {
    let fila: Promise<unknown> = Promise.resolve();
    const request = vi.fn((_nome: string, tarefa: () => Promise<unknown>) => {
      const vez = fila.then(tarefa);
      fila = vez.catch(() => null);
      return vez;
    });
    vi.stubGlobal('navigator', { locks: { request } });
    const primeira = adiada<Response>();
    const segundo = { ...ACESSO, accessToken: 'token-2' };
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(primeira.promessa)
      .mockResolvedValueOnce(resposta(200, segundo));
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const abaA = await import('./session');
    vi.resetModules();
    const abaB = await import('./session');

    const renovacoes = Promise.all([abaA.renovarSessao(), abaB.renovarSessao()]);
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    primeira.resolver(resposta(200, ACESSO));

    await expect(renovacoes).resolves.toEqual([ACESSO, segundo]);
    expect(request).toHaveBeenCalledWith('cybersetor-renovacao', expect.any(Function));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sair espera a renovacao em andamento e so depois encerra no servidor', async () => {
    const pendente = adiada<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(pendente.promessa)
      .mockResolvedValueOnce(resposta(204));
    vi.stubGlobal('fetch', fetchMock);

    const renovacao = renovarSessao();
    const saida = sair();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    pendente.resolver(resposta(200, ACESSO));
    await Promise.all([renovacao, saida]);

    expect(String(fetchMock.mock.calls[1][0])).toContain('/auth/logout');
    expect(sessaoAtual()).toBeNull();
  });

  it('renovacao que termina depois de encerrar a sessao e descartada', async () => {
    const pendente = adiada<Response>();
    vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(pendente.promessa));

    const renovacao = renovarSessao();
    encerrarSessaoLocal();
    pendente.resolver(resposta(200, ACESSO));
    await renovacao;

    expect(sessaoAtual()).toBeNull();
  });

  it('dois pedidos com 401 simultaneo fazem uma unica renovacao', async () => {
    const fetchMock = vi.fn((url: string, init: RequestInit) => {
      if (url.includes('/auth/login')) return Promise.resolve(resposta(200, ACESSO));
      if (url.includes('/auth/refresh'))
        return Promise.resolve(resposta(200, { ...ACESSO, accessToken: 'token-2' }));
      const autorizacao = new Headers(init.headers).get('Authorization');
      return Promise.resolve(
        autorizacao === 'Bearer token-2'
          ? resposta(200, { ok: true })
          : resposta(401, { code: 'UNAUTHENTICATED', message: 'x' }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    await entrar('pessoa@instituto.org.br', 'senha-de-teste-longa');

    const resultados = await Promise.all([
      requisicaoAutenticada('/accounts'),
      requisicaoAutenticada('/accounts'),
    ]);

    expect(resultados).toEqual([{ ok: true }, { ok: true }]);
    expect(chamadas(fetchMock, '/auth/refresh')).toHaveLength(1);
    expect(chamadas(fetchMock, '/accounts')).toHaveLength(4);
  });

  it('resposta 401 renova a sessao e repete a requisicao uma vez com o novo acesso', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(resposta(200, ACESSO))
      .mockResolvedValueOnce(resposta(401, { code: 'UNAUTHENTICATED', message: 'x' }))
      .mockResolvedValueOnce(resposta(200, { ...ACESSO, accessToken: 'token-2' }))
      .mockResolvedValueOnce(resposta(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await entrar('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await expect(requisicaoAutenticada('/accounts')).resolves.toEqual({ ok: true });

    const [primeira, segunda] = chamadas(fetchMock, '/accounts') as [string, RequestInit][];
    expect(new Headers(primeira[1].headers).get('Authorization')).toBe('Bearer token-1');
    expect(new Headers(segunda[1].headers).get('Authorization')).toBe('Bearer token-2');
  });

  it('falha na renovacao encerra a sessao local', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(resposta(200, ACESSO))
      .mockResolvedValueOnce(resposta(401, { code: 'UNAUTHENTICATED', message: 'x' }))
      .mockResolvedValueOnce(resposta(401, { code: 'UNAUTHENTICATED', message: 'x' }));
    vi.stubGlobal('fetch', fetchMock);
    await entrar('pessoa@instituto.org.br', 'senha-de-teste-longa');

    await expect(requisicaoAutenticada('/accounts')).rejects.toMatchObject({ status: 401 });
    expect(sessaoAtual()).toBeNull();
  });
});
