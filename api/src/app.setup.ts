import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { correlationId } from './common/middleware/correlation-id.middleware.js';

export const API_PREFIX = 'v1';

export function trustProxySetting(value: string | undefined): number | string | false {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
}

export function setupApp(
  app: INestApplication,
  opcoes: { corsOrigin: string; trustProxy?: string },
): void {
  const server = app.getHttpAdapter().getInstance() as Express;
  server.set('trust proxy', trustProxySetting(opcoes.trustProxy));
  app.use(correlationId);
  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const origens = opcoes.corsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (origens.length > 0) {
    app.enableCors({ origin: origens, credentials: true });
  }

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('CyberSetor — API')
      .setDescription('Ciclo do projeto financiado do Instituto Cultural e Social No Setor')
      .setVersion(API_PREFIX)
      .addBearerAuth()
      .addCookieAuth('session')
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);
}
