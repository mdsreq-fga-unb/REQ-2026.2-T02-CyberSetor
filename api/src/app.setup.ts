import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { correlationId } from './common/middleware/correlation-id.middleware.js';

export const API_PREFIX = 'v1';

export function setupApp(app: INestApplication, opcoes: { corsOrigin: string }): void {
  app.use(correlationId);
  app.setGlobalPrefix(API_PREFIX);
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
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);
}
