import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';

const VALID = {
  tipo: 'EMENDA',
  orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
  numeroProcesso: '00150-00001234/2026-11',
  valorGlobal: '150000.5',
  dataCelebracao: '2026-03-10',
  vigenciaInicio: '2026-04-01',
  vigenciaFim: '2027-03-31',
};

interface InstrumentBody {
  id: string;
  versao: number;
  valorGlobal: string;
  vigenciaFim: string;
  orgaoConcedente: string;
}

interface SavedBody {
  instrumento: InstrumentBody;
  numeroProcessoRepetido: boolean;
}

describe('Instrumentos de parceria (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;

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

  async function created(body: object = VALID): Promise<SavedBody> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO).post('/v1/instruments', body).expect(201);
    return res.body as SavedBody;
  }

  it('cadastra o instrumento com valor em reais e datas sem horario, e grava a trilha', async () => {
    const { instrumento, numeroProcessoRepetido } = await created();

    expect(instrumento).toMatchObject({
      versao: 1,
      valorGlobal: '150000.50',
      vigenciaFim: '2027-03-31',
      ativo: true,
      documentoFormalEm: null,
    });
    expect(numeroProcessoRepetido).toBe(false);

    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: instrumento.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'INSTRUMENT_CREATED',
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: expect.objectContaining({ valorGlobal: '150000.50' }) as unknown,
    });
  });

  it.each([
    ['campo obrigatorio ausente', { ...VALID, orgaoConcedente: '   ' }],
    ['tipo fora da lista', { ...VALID, tipo: 'CONVENIO' }],
    ['valor com tres casas', { ...VALID, valorGlobal: '10.123' }],
    ['valor zero', { ...VALID, valorGlobal: '0' }],
    ['data inexistente', { ...VALID, vigenciaFim: '2027-02-30' }],
    ['vigencia invertida', { ...VALID, vigenciaFim: '2026-03-31' }],
    ['campo desconhecido', { ...VALID, ativo: false }],
  ])('recusa %s com 400', async (_caso, body) => {
    await as(Perfil.PRESIDENCIA_GESTAO).post('/v1/instruments', body).expect(400);
    expect(await prisma.instrumento.count()).toBe(0);
  });

  it('aceita numero de processo repetido e avisa', async () => {
    await created();
    const segundo = await created({ ...VALID, orgaoConcedente: 'Ministério da Cultura' });

    expect(segundo.numeroProcessoRepetido).toBe(true);
  });

  it('edita com a versao lida, registra so o que mudou e recusa versao antiga com 409', async () => {
    const { instrumento } = await created();
    const path = `/v1/instruments/${instrumento.id}`;

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, vigenciaFim: '2027-06-30' })
      .expect(200);
    expect((res.body as SavedBody).instrumento).toMatchObject({
      versao: 2,
      vigenciaFim: '2027-06-30',
    });

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: instrumento.id, acao: 'INSTRUMENT_UPDATED' },
    });
    expect(edicao.antes).toEqual({ vigenciaFim: '2027-03-31' });
    expect(edicao.depois).toEqual({ vigenciaFim: '2027-06-30' });

    const conflito = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, orgaoConcedente: 'Outro órgão' })
      .expect(409);
    expect((conflito.body as { code: string }).code).toBe('VERSION_CONFLICT');
  });

  it('edicao que inverte a vigencia e recusada', async () => {
    const { instrumento } = await created();

    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/instruments/${instrumento.id}`, { versao: 1, vigenciaInicio: '2028-01-01' })
      .expect(400);
  });

  it('consulta por perfil conforme a matriz da secao 8.5.1', async () => {
    const { instrumento } = await created();

    for (const perfil of [Perfil.NUCLEO_PEDAGOGICO, Perfil.ADMINISTRATIVO_FINANCEIRO]) {
      await as(perfil).get('/v1/instruments').expect(200);
      await as(perfil).get(`/v1/instruments/${instrumento.id}`).expect(200);
      await as(perfil).post('/v1/instruments', VALID).expect(403);
      await as(perfil).patch(`/v1/instruments/${instrumento.id}`, { versao: 1 }).expect(403);
    }
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get('/v1/instruments').expect(403);
      await as(perfil).get(`/v1/instruments/${instrumento.id}`).expect(403);
      await as(perfil).post('/v1/instruments', VALID).expect(403);
      await as(perfil).patch(`/v1/instruments/${instrumento.id}`, { versao: 1 }).expect(403);
    }
    expect(await prisma.instrumento.count()).toBe(1);
  });

  it('conflito de versao nao grava nada', async () => {
    const { instrumento } = await created();
    const path = `/v1/instruments/${instrumento.id}`;
    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1, vigenciaFim: '2027-06-30' });

    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, orgaoConcedente: 'Outro órgão' })
      .expect(409);

    const row = await prisma.instrumento.findUniqueOrThrow({ where: { id: instrumento.id } });
    expect(row).toMatchObject({ versao: 2, orgaoConcedente: VALID.orgaoConcedente });
    expect(
      await prisma.trilhaAuditoria.count({
        where: { entidadeId: instrumento.id, acao: 'INSTRUMENT_UPDATED' },
      }),
    ).toBe(1);
  });

  it.each([
    ['tipo', { tipo: null }],
    ['orgao', { orgaoConcedente: null }],
    ['processo', { numeroProcesso: null }],
    ['valor', { valorGlobal: null }],
    ['data', { vigenciaFim: null }],
  ])('campo nulo na edicao (%s) e recusado com 400', async (_campo, body) => {
    const { instrumento } = await created();

    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/instruments/${instrumento.id}`, { versao: 1, ...body })
      .expect(400);
  });

  it('edicao sem mudanca nao sobe a versao nem grava trilha', async () => {
    const { instrumento } = await created();
    const path = `/v1/instruments/${instrumento.id}`;

    const soVersao = await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1 }).expect(200);
    const mesmosValores = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, valorGlobal: '150000.50', vigenciaFim: VALID.vigenciaFim })
      .expect(200);

    expect((soVersao.body as SavedBody).instrumento.versao).toBe(1);
    expect((mesmosValores.body as SavedBody).instrumento.versao).toBe(1);
    expect(
      await prisma.trilhaAuditoria.count({
        where: { entidadeId: instrumento.id, acao: 'INSTRUMENT_UPDATED' },
      }),
    ).toBe(0);
  });

  it('edicao avisa quando o novo numero de processo ja e usado', async () => {
    await created();
    const { instrumento } = await created({ ...VALID, numeroProcesso: '00150-2/2026' });

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/instruments/${instrumento.id}`, {
        versao: 1,
        numeroProcesso: VALID.numeroProcesso,
      })
      .expect(200);

    expect((res.body as SavedBody).numeroProcessoRepetido).toBe(true);
  });

  it('filtra por ativo e devolve 404 para instrumento inexistente', async () => {
    const { instrumento } = await created();
    await prisma.instrumento.update({ where: { id: instrumento.id }, data: { ativo: false } });

    const ativos = await as(Perfil.PRESIDENCIA_GESTAO)
      .get('/v1/instruments?ativo=true')
      .expect(200);
    const inativos = await as(Perfil.PRESIDENCIA_GESTAO)
      .get('/v1/instruments?ativo=false')
      .expect(200);
    expect(ativos.body).toHaveLength(0);
    expect(inativos.body).toHaveLength(1);

    await as(Perfil.PRESIDENCIA_GESTAO)
      .get('/v1/instruments/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });
});
