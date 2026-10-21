import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { API_PREFIX, setupApp } from './app.setup.js';
import type { EnvironmentVariables } from './config/env.validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  setupApp(app, {
    corsOrigin: config.get('CORS_ORIGIN', { infer: true }),
    trustProxy: config.get('TRUST_PROXY', { infer: true }),
  });

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API em http://localhost:${port}/${API_PREFIX} — docs em /docs`, 'Bootstrap');
}

void bootstrap();
