import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import { AutorTipo, type Perfil } from '../generated/prisma/enums.js';
import type { AuthenticatedRequest } from './authenticated-user.js';
import { IS_PUBLIC_KEY, PROFILES_KEY } from './decorators.js';

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditTrailService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const allowed = this.reflector.getAllAndOverride<Perfil[] | undefined>(PROFILES_KEY, targets);
    if (!allowed || allowed.length === 0) return true;

    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest>();
    if (req.user && allowed.includes(req.user.perfil)) return true;

    await this.audit.record({
      autorTipo: AutorTipo.USUARIO,
      usuarioId: req.user?.usuarioId ?? null,
      acao: 'ACCESS_DENIED',
      entidade: 'rota',
      depois: {
        metodo: req.method,
        rota: req.route ? String((req.route as { path: unknown }).path) : req.path,
      },
      correlationId: String(http.getResponse<Response>().locals.correlationId ?? ''),
    });
    throw new ForbiddenException('Perfil sem permissão para esta operação.');
  }
}
