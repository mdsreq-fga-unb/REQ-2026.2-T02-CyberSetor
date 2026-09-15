// NestJS (Arquivo detalhado - slide D2-S18)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Libera a comunicação com o Frontend Next.js
  app.enableCors({ origin: 'http://localhost:3000' });

  // Escudo global de validação rígida
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();