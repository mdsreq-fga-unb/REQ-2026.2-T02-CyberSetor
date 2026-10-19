import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

export const CSRF_HEADER = 'x-csrf';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.header(CSRF_HEADER) !== '1') {
      throw new ForbiddenException('Cabecalho X-CSRF ausente.');
    }
    return true;
  }
}
