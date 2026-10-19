import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ValidSession } from './session.service.js';

export interface AuthenticatedRequest extends Request {
  user?: ValidSession;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ValidSession | undefined =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
