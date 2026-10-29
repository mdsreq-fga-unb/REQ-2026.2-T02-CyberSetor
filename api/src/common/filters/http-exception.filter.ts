import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  PayloadTooLargeException,
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
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'UNSUPPORTED_MEDIA_TYPE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
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
      code:
        (ehErroDoServidor ? undefined : this.codigoProprio(exception)) ??
        CODIGO_POR_STATUS[status] ??
        (ehErroDoServidor ? 'INTERNAL_ERROR' : 'HTTP_ERROR'),
      message: ehErroDoServidor ? 'Erro interno. Tente novamente.' : this.mensagemDe(exception),
      correlationId,
      details: ehValidacao ? this.detalhesDeValidacao(exception) : {},
    };

    if (ehErroDoServidor) {
      this.logger.error(
        // Sem a query: a busca pode trazer nome, e-mail ou telefone.
        `${req.method} ${req.path} -> ${status} [${correlationId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json(envelope);
  }

  private codigoProprio(exception: unknown): string | undefined {
    if (!(exception instanceof HttpException)) return undefined;
    const body = exception.getResponse();
    const code = typeof body === 'object' ? (body as { code?: unknown }).code : undefined;
    return typeof code === 'string' ? code : undefined;
  }

  private mensagemDe(exception: unknown): string {
    // O multer recusa o arquivo grande com mensagem própria, em inglês.
    if (exception instanceof PayloadTooLargeException && !this.codigoProprio(exception)) {
      return 'O arquivo passa do tamanho máximo permitido.';
    }
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') return body;
      const msg = (body as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return 'Dados inválidos.';
      return exception.message;
    }
    return 'Erro na requisição.';
  }

  private detalhesDeValidacao(exception: unknown): Record<string, unknown> {
    if (!(exception instanceof HttpException)) return {};
    const body = exception.getResponse() as { message?: unknown; details?: unknown };
    if (Array.isArray(body.message)) return { errors: body.message };
    // Recusa de regra com detalhe próprio (ex.: quais campos faltam).
    return body.details && typeof body.details === 'object'
      ? (body.details as Record<string, unknown>)
      : {};
  }
}
