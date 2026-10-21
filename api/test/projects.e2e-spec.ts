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

const NAMES: Record<Perfil, string> = {
  PRESIDENCIA_GESTAO: 'Beatriz Gestão',
  NUCLEO_PEDAGOGICO: 'Ana Pedagógica',
  ADMINISTRATIVO_FINANCEIRO: 'Carla Financeiro',
  CONCEDENTE_AUDITORIA: 'Davi Auditoria',
  ADMINISTRACAO_SISTEMA: 'Eva Administração',
};

interface ProjectBody {
  id: string;
  versao: number;
  instrumentoId: string;
  codigo: string;
  titulo: string;
  coordenador: { id: string; nome: string; ativo: boolean };
  inicio: string;
  fim: string;
}

interface ErrorBody {
  code: string;
  message: string;
  details: { errors?: string[] };
}

describe('Projetos do instrumento (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let desativadaId: string;
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
      const pessoa = await prisma.pessoa.create({ data: { nome: NAMES[perfil] } });
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
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Fábio Desativado' } });
    desativadaId = (
      await prisma.usuario.create({
        data: {
          pessoaId: pessoa.id,
          emailLogin: 'desativada@instituto.test',
          senhaHash,
          perfil: Perfil.NUCLEO_PEDAGOGICO,
          ativo: false,
        },
      })
    ).id;
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
        tipo: TipoInstrumento.EMENDA,
        orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
        numeroProcesso: '00150-00001234/2026-11',
        valorGlobal: '150000.00',
        dataCelebracao: new Date('2026-03-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-04-01T00:00:00.000Z'),
        vigenciaFim: new Date('2027-03-31T00:00:00.000Z'),
        ativo,
      },
    });
    return row.id;
  }

  function valid(): object {
    return {
      codigo: 'P01',
      titulo: 'Oficinas de dança no Setor Comercial Sul',
      coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
      inicio: '2026-05-01',
      fim: '2026-12-15',
    };
  }

  function post(body: object, id = instrumentoId) {
    return as(Perfil.PRESIDENCIA_GESTAO).post(`/v1/instruments/${id}/projects`, body);
  }

  async function created(body: object = {}, id = instrumentoId): Promise<ProjectBody> {
    const res = await post({ ...valid(), ...body }, id).expect(201);
    return res.body as ProjectBody;
  }

  it('cadastra o projeto com coordenador e execucao, e grava a trilha', async () => {
    const projeto = await created({ titulo: '  Oficinas de dança  ' });

    expect(projeto).toMatchObject({
      versao: 1,
      instrumentoId,
      codigo: 'P01',
      titulo: 'Oficinas de dança',
      coordenador: { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: 'Ana Pedagógica', ativo: true },
      inicio: '2026-05-01',
      fim: '2026-12-15',
    });
    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: projeto.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'PROJECT_CREATED',
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: expect.objectContaining({ instrumentoId, codigo: 'P01' }) as unknown,
    });

    const lista = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/instruments/${instrumentoId}/projects`)
      .expect(200);
    expect(lista.body).toEqual([projeto]);
  });

  it.each([
    ['codigo', { codigo: '   ' }],
    ['titulo', { titulo: undefined }],
    ['coordenadorId', { coordenadorId: 'ana' }],
    ['inicio', { inicio: '01/05/2026' }],
    ['fim', { fim: undefined }],
  ])('recusa %s invalido com 400 e indica o campo', async (campo, change) => {
    const res = await post({ ...valid(), ...change }).expect(400);

    const { details } = res.body as ErrorBody;
    expect(details.errors?.some((message) => message.startsWith(campo))).toBe(true);
    expect(await prisma.projeto.count()).toBe(0);
  });

  it('recusa data inexistente e campo desconhecido com 400', async () => {
    await post({ ...valid(), fim: '2026-02-30' }).expect(400);
    await post({ ...valid(), versao: 3 }).expect(400);
    expect(await prisma.projeto.count()).toBe(0);
  });

  it('recusa fim anterior ao inicio', async () => {
    const res = await post({ ...valid(), inicio: '2026-09-01', fim: '2026-08-31' }).expect(400);

    expect((res.body as ErrorBody).code).toBe('INVALID_SCHEDULE');
  });

  it.each([
    ['comeca antes da vigencia', { inicio: '2026-03-31' }],
    ['termina depois da vigencia', { fim: '2027-04-01' }],
  ])('recusa execucao que %s', async (_caso, change) => {
    const res = await post({ ...valid(), ...change }).expect(400);

    expect((res.body as ErrorBody).code).toBe('OUTSIDE_INSTRUMENT_TERM');
    expect((res.body as ErrorBody).message).toContain('01/04/2026 a 31/03/2027');
  });

  it('aceita execucao igual a vigencia inteira', async () => {
    await created({ inicio: '2026-04-01', fim: '2027-03-31' });
  });

  it('recusa codigo repetido no instrumento, sem diferenciar maiusculas, e aceita em outro', async () => {
    await created();

    const repetido = await post({ ...valid(), codigo: 'p01' }).expect(409);
    expect((repetido.body as ErrorBody).code).toBe('PROJECT_CODE_TAKEN');

    const outro = await created({}, await instrument());
    expect(outro.codigo).toBe('P01');
    expect(await prisma.projeto.count()).toBe(2);
  });

  it('instrumento inativo nao recebe nem altera projeto', async () => {
    const projeto = await created();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const cadastro = await post({ ...valid(), codigo: 'P02' }).expect(409);
    const edicao = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/projects/${projeto.id}`, { versao: 1, titulo: 'Outro título' })
      .expect(409);

    expect((cadastro.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect((edicao.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect(await prisma.projeto.count()).toBe(1);
  });

  it('instrumento inexistente devolve 404', async () => {
    await post(valid(), MISSING).expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO).get(`/v1/instruments/${MISSING}/projects`).expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO).get(`/v1/projects/${MISSING}`).expect(404);
  });

  it('recusa coordenador inexistente, desativado ou de perfil nao permitido', async () => {
    for (const coordenadorId of [MISSING, desativadaId, ids[Perfil.ADMINISTRATIVO_FINANCEIRO]]) {
      const res = await post({ ...valid(), coordenadorId }).expect(400);
      expect((res.body as ErrorBody).code).toBe('INVALID_COORDINATOR');
    }
    await created({ coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO] });
  });

  it('lista os coordenadores elegiveis so com id e nome, para quem cadastra', async () => {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .get('/v1/projects/eligible-coordinators')
      .expect(200);

    expect(res.body).toEqual([
      { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: 'Ana Pedagógica' },
      { id: ids[Perfil.PRESIDENCIA_GESTAO], nome: 'Beatriz Gestão' },
    ]);
  });

  it('edita com a versao lida, registra so o que mudou e recusa versao antiga sem gravar', async () => {
    const projeto = await created();
    const path = `/v1/projects/${projeto.id}`;

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, fim: '2027-01-31', coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO] })
      .expect(200);
    expect(res.body).toMatchObject({
      versao: 2,
      fim: '2027-01-31',
      coordenador: { nome: 'Beatriz Gestão' },
    });

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: projeto.id, acao: 'PROJECT_UPDATED' },
    });
    expect(edicao.antes).toEqual({
      coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
      fim: '2026-12-15',
    });
    expect(edicao.depois).toEqual({
      coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO],
      fim: '2027-01-31',
    });

    const conflito = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, titulo: 'Outro título' })
      .expect(409);
    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');
    const row = await prisma.projeto.findUniqueOrThrow({ where: { id: projeto.id } });
    expect(row).toMatchObject({ versao: 2, titulo: projeto.titulo });
  });

  it('edicao sem mudanca nao sobe a versao nem grava trilha', async () => {
    const projeto = await created();

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/projects/${projeto.id}`, { versao: 1, codigo: 'P01', inicio: '2026-05-01' })
      .expect(200);

    expect((res.body as ProjectBody).versao).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'PROJECT_UPDATED' } })).toBe(0);
  });

  it('na edicao, recusa codigo de outro projeto, fim antes do inicio e campo nulo', async () => {
    await created();
    const segundo = await created({ codigo: 'P02' });
    const path = `/v1/projects/${segundo.id}`;

    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1, codigo: 'P01' }).expect(409);
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, inicio: '2027-01-01' })
      .expect(400);
    await as(Perfil.PRESIDENCIA_GESTAO).patch(path, { versao: 1, titulo: null }).expect(400);
  });

  it('coordenador desativado so e conferido quando muda', async () => {
    const projeto = await created();
    await prisma.projeto.update({
      where: { id: projeto.id },
      data: { coordenadorId: desativadaId },
    });
    const path = `/v1/projects/${projeto.id}`;

    const atual = await as(Perfil.PRESIDENCIA_GESTAO).get(path).expect(200);
    expect((atual.body as ProjectBody).coordenador).toMatchObject({ ativo: false });
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, titulo: 'Novo título' })
      .expect(200);

    const outro = await created({ codigo: 'P02' });
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/projects/${outro.id}`, { versao: 1, coordenadorId: desativadaId })
      .expect(400);
  });

  it('acesso por perfil conforme a matriz da secao 8.5.1', async () => {
    const projeto = await created();
    const list = `/v1/instruments/${instrumentoId}/projects`;
    const detail = `/v1/projects/${projeto.id}`;

    for (const perfil of [Perfil.NUCLEO_PEDAGOGICO, Perfil.ADMINISTRATIVO_FINANCEIRO]) {
      await as(perfil).get(list).expect(200);
      await as(perfil).get(detail).expect(200);
      await as(perfil)
        .post(list, { ...valid(), codigo: 'P02' })
        .expect(403);
      await as(perfil).patch(detail, { versao: 1, titulo: 'x' }).expect(403);
      await as(perfil).get('/v1/projects/eligible-coordinators').expect(403);
    }
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(list).expect(403);
      await as(perfil).get(detail).expect(403);
      await as(perfil)
        .post(list, { ...valid(), codigo: 'P02' })
        .expect(403);
      await as(perfil).patch(detail, { versao: 1, titulo: 'x' }).expect(403);
      await as(perfil).get('/v1/projects/eligible-coordinators').expect(403);
    }
    expect(await prisma.projeto.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'PROJECT_UPDATED' } })).toBe(0);
  });
});
