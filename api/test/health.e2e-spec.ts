import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import type { ErrorEnvelope } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('API (e2e)', () => {
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

  it('GET /v1/health responde 200 com status ok e devolve o correlation id', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/health')
      .set('x-correlation-id', 'teste-123')
      .expect(200);

    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.headers['x-correlation-id']).toBe('teste-123');
  });

  it('GET /v1/health responde 503 com SERVICE_UNAVAILABLE quando o banco nao responde', async () => {
    vi.spyOn(app.get(PrismaService), 'verificarConexao').mockResolvedValueOnce(false);

    const res = await request(app.getHttpServer()).get('/v1/health').expect(503);

    expect(res.body).toMatchObject({ code: 'SERVICE_UNAVAILABLE', details: {} });
  });

  it('rota inexistente responde 404 no envelope de erro', async () => {
    const res = await request(app.getHttpServer()).get('/v1/nao-existe').expect(404);

    const body = res.body as ErrorEnvelope;
    expect(body).toMatchObject({ code: 'NOT_FOUND' });
    expect(typeof body.correlationId).toBe('string');
    expect(body.correlationId.length).toBeGreaterThan(0);
    expect(body.details).toEqual({});
  });

  it('JSON malformado responde 400 no envelope de erro com o correlation id', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/health')
      .set('Content-Type', 'application/json')
      .send('{')
      .expect(400);

    const body = res.body as ErrorEnvelope;
    expect(body.correlationId.length).toBeGreaterThan(0);
    expect(res.headers['x-correlation-id']).toBe(body.correlationId);
  });

  it('rota fora do prefixo devolve o correlation id no cabecalho', async () => {
    const res = await request(app.getHttpServer()).get('/nao-existe').expect(404);

    expect(res.headers['x-correlation-id']).toMatch(/^[\w-]{1,128}$/);
  });

  it('correlation id recebido fora do formato e substituido', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/health')
      .set('x-correlation-id', 'id com espacos [forjado]')
      .expect(200);

    expect(res.headers['x-correlation-id']).not.toBe('id com espacos [forjado]');
  });

  it('GET /docs-json publica o contrato OpenAPI com a rota de saude', async () => {
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);

    const documento = res.body as { paths: Record<string, unknown> };
    expect(documento.paths).toHaveProperty('/v1/health');
  });
});
