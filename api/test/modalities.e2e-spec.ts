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
const VALID = { nome: 'Oficina contínua', descricao: 'Turma com encontros regulares' };

interface ModalityBody {
  id: string;
  versao: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

describe('Modalidades de objeto (e2e)', () => {
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
      'TRUNCATE TABLE trilha_auditoria, sessao, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
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
      'TRUNCATE TABLE trilha_auditoria, modalidade RESTART IDENTITY CASCADE',
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

  async function created(body: object = VALID): Promise<ModalityBody> {
    const res = await as(Perfil.NUCLEO_PEDAGOGICO).post('/v1/modalities', body).expect(201);
    return res.body as ModalityBody;
  }

  it('o nucleo pedagogico cadastra a modalidade, sem lista fixa, e grava a trilha', async () => {
    const modalidade = await created();

    expect(modalidade).toMatchObject({ versao: 1, nome: 'Oficina contínua', ativo: true });
    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: modalidade.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'MODALITY_CREATED',
      usuarioId: ids[Perfil.NUCLEO_PEDAGOGICO],
      depois: expect.objectContaining({ nome: 'Oficina contínua' }) as unknown,
    });
  });

  it('cadastra sem descricao e apara espacos do nome', async () => {
    const modalidade = await created({ nome: '  Evento aberto  ' });

    expect(modalidade).toMatchObject({ nome: 'Evento aberto', descricao: null });
  });

  it.each([
    ['nome vazio', { nome: '   ' }],
    ['nome ausente', { descricao: 'sem nome' }],
    ['nome longo demais', { nome: 'x'.repeat(121) }],
    ['campo desconhecido', { ...VALID, ativo: false }],
  ])('recusa %s com 400', async (_caso, body) => {
    await as(Perfil.NUCLEO_PEDAGOGICO).post('/v1/modalities', body).expect(400);
    expect(await prisma.modalidade.count()).toBe(0);
  });

  it('recusa nome repetido, sem diferenciar maiusculas, no cadastro e na edicao', async () => {
    await created();
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .post('/v1/modalities', { nome: 'OFICINA CONTÍNUA' })
      .expect(409);

    const outra = await created({ nome: 'Ação de acolhimento' });
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(`/v1/modalities/${outra.id}`, { versao: 1, nome: 'oficina contínua' })
      .expect(409);
    expect(await prisma.modalidade.count()).toBe(2);
  });

  it('edita com a versao lida, registra so o que mudou e recusa versao antiga com 409', async () => {
    const modalidade = await created();
    const path = `/v1/modalities/${modalidade.id}`;

    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 1, nome: 'Oficina formativa contínua' })
      .expect(200);
    expect(res.body as ModalityBody).toMatchObject({
      versao: 2,
      nome: 'Oficina formativa contínua',
    });

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: modalidade.id, acao: 'MODALITY_UPDATED' },
    });
    expect(edicao.antes).toEqual({ nome: 'Oficina contínua' });
    expect(edicao.depois).toEqual({ nome: 'Oficina formativa contínua' });

    const conflito = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 1, descricao: 'Outra' })
      .expect(409);
    expect((conflito.body as { code: string }).code).toBe('VERSION_CONFLICT');
  });

  it('desativa e reativa em vez de excluir, e filtra pela situacao', async () => {
    const modalidade = await created();
    await created({ nome: 'Evento aberto' });
    const path = `/v1/modalities/${modalidade.id}`;

    await as(Perfil.NUCLEO_PEDAGOGICO).patch(path, { versao: 1, ativo: false }).expect(200);
    const ativas = await as(Perfil.NUCLEO_PEDAGOGICO).get('/v1/modalities?ativo=true').expect(200);
    expect((ativas.body as ModalityBody[]).map((m) => m.nome)).toEqual(['Evento aberto']);

    const reativada = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 2, ativo: true })
      .expect(200);
    expect(reativada.body as ModalityBody).toMatchObject({ versao: 3, ativo: true });
    expect(await prisma.modalidade.count()).toBe(2);
  });

  it('apaga a descricao com texto vazio e edicao sem mudanca nao sobe a versao', async () => {
    const modalidade = await created();
    const path = `/v1/modalities/${modalidade.id}`;

    const semDescricao = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 1, descricao: '' })
      .expect(200);
    expect(semDescricao.body as ModalityBody).toMatchObject({ versao: 2, descricao: null });

    const igual = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 2, nome: 'Oficina contínua' })
      .expect(200);
    expect((igual.body as ModalityBody).versao).toBe(2);
    expect(
      await prisma.trilhaAuditoria.count({
        where: { entidadeId: modalidade.id, acao: 'MODALITY_UPDATED' },
      }),
    ).toBe(1);
  });

  it('acesso por perfil: nucleo e gestao escrevem, financeiro consulta, os demais nao acessam', async () => {
    const modalidade = await created();
    const path = `/v1/modalities/${modalidade.id}`;

    await as(Perfil.PRESIDENCIA_GESTAO)
      .post('/v1/modalities', { nome: 'Evento aberto' })
      .expect(201);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get('/v1/modalities').expect(200);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get(path).expect(200);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).post('/v1/modalities', { nome: 'X' }).expect(403);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).patch(path, { versao: 1 }).expect(403);
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get('/v1/modalities').expect(403);
      await as(perfil).post('/v1/modalities', { nome: 'Y' }).expect(403);
    }
    expect(await prisma.modalidade.count()).toBe(2);
  });

  it('modalidade inexistente devolve 404', async () => {
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .get('/v1/modalities/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });
});
