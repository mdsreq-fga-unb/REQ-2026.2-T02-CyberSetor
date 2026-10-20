import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuditTrailService } from '../audit/audit-trail.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { IS_PUBLIC_KEY, PROFILES_KEY } from './decorators.js';
import { ProfilesGuard } from './profiles.guard.js';
import type { ValidSession } from './session.service.js';

describe('ProfilesGuard', () => {
  const record = vi.fn();
  const guard = new ProfilesGuard(new Reflector(), { record } as unknown as AuditTrailService);

  function context(
    metadata: Record<string, unknown>,
    user?: Partial<ValidSession>,
  ): ExecutionContext {
    const handler = () => undefined;
    for (const [key, value] of Object.entries(metadata)) {
      Reflect.defineMetadata(key, value, handler);
    }
    return {
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ user, method: 'GET', path: '/v1/rota' }),
        getResponse: () => ({ locals: { correlationId: 'c-1' } }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => record.mockReset());

  it('libera rota publica e rota sem perfis declarados', async () => {
    await expect(guard.canActivate(context({ [IS_PUBLIC_KEY]: true }))).resolves.toBe(true);
    await expect(
      guard.canActivate(context({}, { perfil: Perfil.NUCLEO_PEDAGOGICO })),
    ).resolves.toBe(true);
  });

  it('libera o perfil listado', async () => {
    const ctx = context(
      { [PROFILES_KEY]: [Perfil.PRESIDENCIA_GESTAO, Perfil.NUCLEO_PEDAGOGICO] },
      { perfil: Perfil.NUCLEO_PEDAGOGICO },
    );

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(record).not.toHaveBeenCalled();
  });

  it('nega com 403 o perfil fora da lista e registra o acesso negado', async () => {
    const ctx = context(
      { [PROFILES_KEY]: [Perfil.PRESIDENCIA_GESTAO] },
      { usuarioId: 'u-1', perfil: Perfil.ADMINISTRACAO_SISTEMA },
    );

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 'u-1', acao: 'ACCESS_DENIED', correlationId: 'c-1' }),
    );
  });
});
