import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { LOGIN_ATTEMPTS_PER_MINUTE_PER_IP } from '../src/auth/login-protection.js';

describe('Limite de tentativas de login por IP (e2e)', () => {
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

  it('responde 429 RATE_LIMITED depois do limite por minuto, sem tocar na senha', async () => {
    const attempt = () =>
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'ninguem@instituto.test', senha: 'senha qualquer de teste' });

    for (let i = 0; i < LOGIN_ATTEMPTS_PER_MINUTE_PER_IP; i++) {
      await attempt().expect(401);
    }
    const res = await attempt().expect(429);

    expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
    expect(res.headers['retry-after']).toBeDefined();
  });
});
