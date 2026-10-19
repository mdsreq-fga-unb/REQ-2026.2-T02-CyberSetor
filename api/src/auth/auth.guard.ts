import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest } from './authenticated-user.js';
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY, IS_PUBLIC_KEY } from './decorators.js';
import { SessionService } from './session.service.js';

interface AccessTokenPayload {
  sub: string;
  sid: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearer(req.headers.authorization);
    if (!token) throw new UnauthorizedException('Credenciais ausentes.');

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Credenciais invalidas ou expiradas.');
    }
    if (typeof payload.sid !== 'string' || typeof payload.sub !== 'string') {
      throw new UnauthorizedException('Credenciais invalidas ou expiradas.');
    }

    const session = await this.sessions.validateAccess(payload.sid);
    if (!session || session.usuarioId !== payload.sub) {
      throw new UnauthorizedException('Sessao encerrada. Entre novamente.');
    }

    if (
      session.deveTrocarSenha &&
      !this.reflector.getAllAndOverride<boolean>(ALLOW_PENDING_PASSWORD_CHANGE_KEY, targets)
    ) {
      throw new ForbiddenException({
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'Troque a senha temporaria antes de continuar.',
      });
    }

    req.user = session;
    return true;
  }

  private extractBearer(header: string | undefined): string | undefined {
    const [scheme, token] = header?.split(' ') ?? [];
    return scheme === 'Bearer' && token ? token : undefined;
  }
}
