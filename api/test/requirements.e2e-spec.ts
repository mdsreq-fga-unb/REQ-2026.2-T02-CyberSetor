import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { Perfil, TipoInstrumento } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';
const MISSING = '00000000-0000-4000-8000-000000000000';

interface RequirementBody {
  id: string;
  versao: number;
  instrumentoId: string;
  descricao: string;
  referencia: string | null;
}

interface ErrorBody {
  code: string;
  message: string;
  details: { errors?: string[] };
}

describe('Requisitos do instrumento (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await passwords.hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      const pessoa = await prisma.pessoa.create({ data: { nome: perfil } });
      const usuario = await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      ids[perfil] = usuario.id;
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      tokens[perfil] = (res.body as { accessToken: string }).accessToken;
    }
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    instrumentoId = await instrument();
  });

  afterAll(async () => {
    await app.close();
  });

  function as(perfil: Perfil) {
    const server = request(app.getHttpServer());
    const auth = `Bearer ${tokens[perfil]}`;
    return {
      get: (path: string) => server.get(path).set('Authorization', auth),
      post: (path: string, body: object) => server.post(path).set('Authorization', auth).send(body),
      patch: (path: string, body: object) =>
        server.patch(path).set('Authorization', auth).send(body),
    };
  }

  async function instrument(ativo = true): Promise<string> {
    const row = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
        numeroProcesso: '71000.057425/2025-03',
        valorGlobal: '300000.00',
        dataCelebracao: new Date('2025-11-07T00:00:00.000Z'),
        vigenciaInicio: new Date('2025-12-31T00:00:00.000Z'),
        vigenciaFim: new Date('2026-07-26T00:00:00.000Z'),
        ativo,
      },
    });
    return row.id;
  }

  function valid(): object {
    return {
      descricao: 'Frequência mínima de 70% dos participantes nas oficinas',
      referencia: 'Termo de referência, item 24.1',
    };
  }

  function post(body: object, id = instrumentoId) {
    return as(Perfil.PRESIDENCIA_GESTAO).post(`/v1/instruments/${id}/requirements`, body);
  }

  async function created(body: object = {}, id = instrumentoId): Promise<RequirementBody> {
    const res = await post({ ...valid(), ...body }, id).expect(201);
    return res.body as RequirementBody;
  }

  it('cadastra o requisito no instrumento, lista na ordem de cadastro e grava a trilha', async () => {
    const primeiro = await created({ descricao: '  Certificado para quem concluir  ' });
    const segundo = await created({ referencia: undefined });

    expect(primeiro).toMatchObject({
      versao: 1,
      instrumentoId,
      descricao: 'Certificado para quem concluir',
      referencia: 'Termo de referência, item 24.1',
    });
    expect(segundo.referencia).toBeNull();
    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: primeiro.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'REQUIREMENT_CREATED',
      entidade: 'requisito_instrumento',
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: {
        instrumentoId,
        descricao: 'Certificado para quem concluir',
        referencia: 'Termo de referência, item 24.1',
      },
    });

    const lista = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/instruments/${instrumentoId}/requirements`)
      .expect(200);
    expect(lista.body).toEqual([primeiro, segundo]);
  });

  it('lista so os requisitos do instrumento pedido', async () => {
    await created();
    const outro = await instrument();
    const doOutro = await created({}, outro);

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/instruments/${outro}/requirements`)
      .expect(200);
    expect(res.body).toEqual([doOutro]);
  });

  it.each([
    ['descricao', { descricao: '   ' }],
    ['descricao', { descricao: 'x'.repeat(1001) }],
    ['referencia', { referencia: 'x'.repeat(101) }],
  ])('recusa %s invalido com 400 e indica o campo', async (campo, change) => {
    const res = await post({ ...valid(), ...change }).expect(400);

    const { details } = res.body as ErrorBody;
    expect(details.errors?.some((message) => message.startsWith(campo))).toBe(true);
    expect(await prisma.requisitoInstrumento.count()).toBe(0);
  });

  it('recusa campo desconhecido com 400, e o instrumento do requisito nao muda', async () => {
    await post({ ...valid(), instrumentoId: MISSING }).expect(400);
    const requisito = await created();
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/requirements/${requisito.id}`, { versao: 1, instrumentoId: await instrument() })
      .expect(400);
    const row = await prisma.requisitoInstrumento.findUniqueOrThrow({
      where: { id: requisito.id },
    });
    expect(row).toMatchObject({ versao: 1, instrumentoId });
  });

  it('instrumento inexistente devolve 404', async () => {
    await post(valid(), MISSING).expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO).get(`/v1/instruments/${MISSING}/requirements`).expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/requirements/${MISSING}`, { versao: 1, descricao: 'x' })
      .expect(404);
  });

  it('instrumento inativo nao recebe nem altera requisito', async () => {
    const requisito = await created();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const cadastro = await post(valid()).expect(409);
    const edicao = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/requirements/${requisito.id}`, { versao: 1, descricao: 'Outra' })
      .expect(409);

    expect((cadastro.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect((edicao.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect(await prisma.requisitoInstrumento.count()).toBe(1);
  });

  it('edita com a versao lida, registra so o que mudou e recusa versao antiga sem gravar', async () => {
    const requisito = await created();
    const path = `/v1/requirements/${requisito.id}`;

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, referencia: 'Plano de trabalho, meta 1' })
      .expect(200);
    expect(res.body).toMatchObject({ versao: 2, referencia: 'Plano de trabalho, meta 1' });

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: requisito.id, acao: 'REQUIREMENT_UPDATED' },
    });
    expect(edicao.antes).toEqual({ referencia: 'Termo de referência, item 24.1' });
    expect(edicao.depois).toEqual({ referencia: 'Plano de trabalho, meta 1' });

    const conflito = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, descricao: 'Outra' })
      .expect(409);
    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');
    const row = await prisma.requisitoInstrumento.findUniqueOrThrow({
      where: { id: requisito.id },
    });
    expect(row).toMatchObject({ versao: 2, descricao: requisito.descricao });
  });

  it('duas edicoes simultaneas da mesma versao: uma grava, a outra recebe 409', async () => {
    const requisito = await created();
    const path = `/v1/requirements/${requisito.id}`;

    const respostas = await Promise.all([
      as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1, descricao: 'Primeira' }),
      as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1, descricao: 'Segunda' }),
    ]);

    expect(respostas.map((res) => res.status).sort()).toEqual([200, 409]);
    const vencedora = respostas.find((res) => res.status === 200)?.body as RequirementBody;
    const row = await prisma.requisitoInstrumento.findUniqueOrThrow({
      where: { id: requisito.id },
    });
    expect(row).toMatchObject({ versao: 2, descricao: vencedora.descricao });
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'REQUIREMENT_UPDATED' } })).toBe(1);
  });

  it('apaga a referencia com texto vazio ou null e recusa descricao vazia', async () => {
    const requisito = await created();
    const path = `/v1/requirements/${requisito.id}`;

    const vazio = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, referencia: '' })
      .expect(200);
    expect(vazio.body).toMatchObject({ versao: 2, referencia: null });
    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 2, referencia: null }).expect(200);
    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 2, descricao: '' }).expect(400);
    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 2, descricao: null }).expect(400);
  });

  it('edicao sem mudanca nao sobe a versao nem grava trilha', async () => {
    const requisito = await created();

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/requirements/${requisito.id}`, { versao: 1, descricao: requisito.descricao })
      .expect(200);

    expect((res.body as RequirementBody).versao).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'REQUIREMENT_UPDATED' } })).toBe(0);
  });

  it('acesso por perfil conforme a matriz da secao 8.5.1', async () => {
    const requisito = await created();
    const list = `/v1/instruments/${instrumentoId}/requirements`;
    const detail = `/v1/requirements/${requisito.id}`;

    for (const perfil of [Perfil.NUCLEO_PEDAGOGICO, Perfil.ADMINISTRATIVO_FINANCEIRO]) {
      await as(perfil).get(list).expect(200);
      await as(perfil).post(list, valid()).expect(403);
      await as(perfil).patch(detail, { versao: 1, descricao: 'x' }).expect(403);
    }
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(list).expect(403);
      await as(perfil).post(list, valid()).expect(403);
      await as(perfil).patch(detail, { versao: 1, descricao: 'x' }).expect(403);
    }
    await request(app.getHttpServer()).get(list).expect(401);
    await request(app.getHttpServer()).post(list).send(valid()).expect(401);
    await request(app.getHttpServer())
      .patch(detail)
      .send({ versao: 1, descricao: 'x' })
      .expect(401);
    expect(await prisma.requisitoInstrumento.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'REQUIREMENT_UPDATED' } })).toBe(0);
  });
});
