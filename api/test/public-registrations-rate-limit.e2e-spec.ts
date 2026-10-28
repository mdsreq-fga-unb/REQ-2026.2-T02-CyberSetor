import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { PUBLIC_SUBMISSIONS_PER_MINUTE_PER_IP } from '../src/public-registrations/public-registrations.controller.js';

describe('Limite de envios do formulário público por IP (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 429 RATE_LIMITED depois do limite por minuto', async () => {
    const envio = () =>
      request(app.getHttpServer()).post('/v1/public/registrations/codigoQueNaoExis').send({});
    for (let i = 0; i < PUBLIC_SUBMISSIONS_PER_MINUTE_PER_IP; i++) {
      await envio().expect(400);
    }
    const res = await envio().expect(429);
    expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
  });
});
