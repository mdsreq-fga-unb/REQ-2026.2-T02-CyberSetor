import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const CORRELATION_HEADER = 'x-correlation-id';

const FORMATO_ACEITO = /^[\w-]{1,128}$/;

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const recebido = req.header(CORRELATION_HEADER);
  const id = recebido && FORMATO_ACEITO.test(recebido) ? recebido : randomUUID();
  res.setHeader(CORRELATION_HEADER, id);
  res.locals.correlationId = id;
  next();
}
