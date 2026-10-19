import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const recebido = req.header(CORRELATION_HEADER);
    const id = recebido && recebido.length <= 128 ? recebido : randomUUID();
    res.setHeader(CORRELATION_HEADER, id);
    res.locals.correlationId = id;
    next();
  }
}
