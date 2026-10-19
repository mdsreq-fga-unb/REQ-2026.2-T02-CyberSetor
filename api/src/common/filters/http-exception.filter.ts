import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorEnvelope {
  code: string;
  message: string;
  correlationId: string;
  details: Record<string, unknown>;
}

const CODIGO_POR_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
};

const LIMIAR_ERRO_DO_SERVIDOR: number = HttpStatus.INTERNAL_SERVER_ERROR;
const STATUS_VALIDACAO: number = HttpStatus.BAD_REQUEST;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const correlationId = String(res.locals.correlationId ?? '');

    const status: number =
      exception instanceof HttpException ? exception.getStatus() : LIMIAR_ERRO_DO_SERVIDOR;
    const ehErroDoServidor = status >= LIMIAR_ERRO_DO_SERVIDOR;
    const ehValidacao = status === STATUS_VALIDACAO;

    const envelope: ErrorEnvelope = {
      code: CODIGO_POR_STATUS[status] ?? (ehErroDoServidor ? 'INTERNAL_ERROR' : 'HTTP_ERROR'),
      message: ehErroDoServidor ? 'Erro interno. Tente novamente.' : this.mensagemDe(exception),
      correlationId,
      details: ehValidacao ? this.detalhesDeValidacao(exception) : {},
    };

    if (ehErroDoServidor) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status} [${correlationId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json(envelope);
  }

  private mensagemDe(exception: unknown): string {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') return body;
      const msg = (body as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return 'Dados invalidos.';
      return exception.message;
    }
    return 'Erro na requisicao.';
  }

  private detalhesDeValidacao(exception: unknown): Record<string, unknown> {
    if (!(exception instanceof HttpException)) return {};
    const body = exception.getResponse();
    const msg = (body as { message?: unknown }).message;
    return Array.isArray(msg) ? { errors: msg } : {};
  }
}
