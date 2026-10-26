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
const MISSING = '00000000-0000-4000-8000-000000000000';

interface SectorBody {
  id: string;
  versao: number;
  nome: string;
  ativo: boolean;
}

interface AccountBody {
  id: string;
  setor: { id: string; nome: string } | null;
}

interface ErrorBody {
  code: string;
  message: string;
  details: { errors?: string[] };
}

describe('Setores e setor da pessoa (e2e)', () => {
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
    await prisma.pessoa.updateMany({ data: { setorId: null } });
    await prisma.$executeRawUnsafe('TRUNCATE TABLE trilha_auditoria');
    await prisma.setor.deleteMany();
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

  async function created(nome = 'Coordenação Pedagógica'): Promise<SectorBody> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO).post('/v1/sectors', { nome }).expect(201);
    return res.body as SectorBody;
  }

  it('a gestao cadastra o setor, a lista sai em ordem de nome e a trilha registra', async () => {
    const pedagogica = await created('  Coordenação Pedagógica  ');
    const execucao = await created('Coordenação de Execução');

    expect(pedagogica).toMatchObject({ versao: 1, nome: 'Coordenação Pedagógica', ativo: true });
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: pedagogica.id },
    });
    expect(trilha).toMatchObject({
      acao: 'SECTOR_CREATED',
      entidade: 'setor',
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: { nome: 'Coordenação Pedagógica', ativo: true },
    });

    const lista = await as(Perfil.PRESIDENCIA_GESTAO).get('/v1/sectors').expect(200);
    expect(lista.body).toEqual([execucao, pedagogica]);
  });

  it.each([
    ['nome vazio', { nome: '   ' }],
    ['nome longo', { nome: 'x'.repeat(121) }],
    ['campo desconhecido', { nome: 'Comunicação', ativo: false }],
  ])('recusa %s com 400', async (_caso, body) => {
    await as(Perfil.PRESIDENCIA_GESTAO).post('/v1/sectors', body).expect(400);
    expect(await prisma.setor.count()).toBe(0);
  });

  it('recusa nome repetido, sem diferenciar maiusculas, no cadastro e na edicao', async () => {
    await created('Comunicação');
    const outro = await created('Captação de Recursos');

    const cadastro = await as(Perfil.PRESIDENCIA_GESTAO)
      .post('/v1/sectors', { nome: 'comunicação' })
      .expect(409);
    const edicao = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/sectors/${outro.id}`, { versao: 1, nome: 'COMUNICAÇÃO' })
      .expect(409);

    expect((cadastro.body as ErrorBody).code).toBe('SECTOR_NAME_TAKEN');
    expect((edicao.body as ErrorBody).code).toBe('SECTOR_NAME_TAKEN');
  });

  it('edita com a versao lida, desativa em vez de excluir e recusa versao antiga', async () => {
    const setor = await created('Social');
    const path = `/v1/sectors/${setor.id}`;

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, nome: 'Coordenação Social', ativo: false })
      .expect(200);
    expect(res.body).toMatchObject({ versao: 2, nome: 'Coordenação Social', ativo: false });
    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: setor.id, acao: 'SECTOR_UPDATED' },
    });
    expect(edicao.antes).toEqual({ nome: 'Social', ativo: true });
    expect(edicao.depois).toEqual({ nome: 'Coordenação Social', ativo: false });

    const ativos = await as(Perfil.PRESIDENCIA_GESTAO).get('/v1/sectors?ativo=true').expect(200);
    expect(ativos.body).toEqual([]);

    const conflito = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 1, nome: 'Outro' })
      .expect(409);
    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');

    const semMudanca = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, { versao: 2, nome: 'Coordenação Social' })
      .expect(200);
    expect((semMudanca.body as SectorBody).versao).toBe(2);
  });

  it('setor inexistente devolve 404', async () => {
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/sectors/${MISSING}`, { versao: 1, nome: 'x' })
      .expect(404);
  });

  it('acesso: gestao escreve; leitores e administracao consultam; concedente nao acessa', async () => {
    const setor = await created('Cultural');
    const path = `/v1/sectors/${setor.id}`;

    for (const perfil of [
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await as(perfil).get('/v1/sectors').expect(200);
      await as(perfil).post('/v1/sectors', { nome: 'Outro' }).expect(403);
      await as(perfil).patch(path, { versao: 1, nome: 'Outro' }).expect(403);
    }
    await as(Perfil.CONCEDENTE_AUDITORIA).get('/v1/sectors').expect(403);
    await request(app.getHttpServer()).get('/v1/sectors').expect(401);
    expect(await prisma.setor.count()).toBe(1);
  });

  describe('setor da pessoa', () => {
    it('a conta nasce com setor, a lista de contas mostra e a sessao devolve', async () => {
      const setor = await created('Coordenação Pedagógica');

      const res = await as(Perfil.ADMINISTRACAO_SISTEMA)
        .post('/v1/accounts', {
          nome: 'Ana Educadora',
          emailLogin: 'ana@instituto.test',
          perfil: Perfil.NUCLEO_PEDAGOGICO,
          setorId: setor.id,
        })
        .expect(201);
      const conta = (res.body as { conta: AccountBody }).conta;
      expect(conta.setor).toEqual({ id: setor.id, nome: 'Coordenação Pedagógica' });
      const criacao = await prisma.trilhaAuditoria.findFirstOrThrow({
        where: { entidadeId: conta.id, acao: 'ACCOUNT_CREATED' },
      });
      expect(criacao.depois).toMatchObject({ setorId: setor.id });

      await as(Perfil.ADMINISTRACAO_SISTEMA)
        .patch(`/v1/accounts/${ids[Perfil.NUCLEO_PEDAGOGICO]}/sector`, { setorId: setor.id })
        .expect(200);
      const sessao = await as(Perfil.NUCLEO_PEDAGOGICO).get('/v1/auth/session').expect(200);
      expect((sessao.body as AccountBody).setor).toEqual({
        id: setor.id,
        nome: 'Coordenação Pedagógica',
      });
    });

    it('muda e tira o setor da pessoa, com trilha so do que mudou', async () => {
      const pedagogica = await created('Coordenação Pedagógica');
      const execucao = await created('Coordenação de Execução');
      const path = `/v1/accounts/${ids[Perfil.NUCLEO_PEDAGOGICO]}/sector`;

      await as(Perfil.ADMINISTRACAO_SISTEMA).patch(path, { setorId: pedagogica.id }).expect(200);
      const troca = await as(Perfil.ADMINISTRACAO_SISTEMA)
        .patch(path, { setorId: execucao.id })
        .expect(200);
      expect((troca.body as AccountBody).setor?.nome).toBe('Coordenação de Execução');
      const semSetor = await as(Perfil.ADMINISTRACAO_SISTEMA)
        .patch(path, { setorId: null })
        .expect(200);
      expect((semSetor.body as AccountBody).setor).toBeNull();
      await as(Perfil.ADMINISTRACAO_SISTEMA).patch(path, { setorId: null }).expect(200);

      const trilha = await prisma.trilhaAuditoria.findMany({
        where: { entidadeId: ids[Perfil.NUCLEO_PEDAGOGICO], acao: 'ACCOUNT_SECTOR_CHANGED' },
        orderBy: { criadoEm: 'asc' },
      });
      expect(trilha.map((evento) => [evento.antes, evento.depois])).toEqual([
        [{ setorId: null }, { setorId: pedagogica.id }],
        [{ setorId: pedagogica.id }, { setorId: execucao.id }],
        [{ setorId: execucao.id }, { setorId: null }],
      ]);
      const sessao = await as(Perfil.NUCLEO_PEDAGOGICO).get('/v1/auth/session').expect(200);
      expect((sessao.body as AccountBody).setor).toBeNull();
    });

    it('recusa setor inexistente ou inativo, na criacao e na troca', async () => {
      const inativo = await created('Antigo');
      await as(Perfil.PRESIDENCIA_GESTAO)
        .patch(`/v1/sectors/${inativo.id}`, { versao: 1, ativo: false })
        .expect(200);

      for (const setorId of [MISSING, inativo.id]) {
        const criacao = await as(Perfil.ADMINISTRACAO_SISTEMA)
          .post('/v1/accounts', {
            nome: 'Bia',
            emailLogin: `bia-${setorId.slice(0, 4)}@instituto.test`,
            perfil: Perfil.NUCLEO_PEDAGOGICO,
            setorId,
          })
          .expect(400);
        expect((criacao.body as ErrorBody).code).toBe('INVALID_SECTOR');
        const troca = await as(Perfil.ADMINISTRACAO_SISTEMA)
          .patch(`/v1/accounts/${ids[Perfil.NUCLEO_PEDAGOGICO]}/sector`, { setorId })
          .expect(400);
        expect((troca.body as ErrorBody).code).toBe('INVALID_SECTOR');
      }
      expect(await prisma.usuario.count({ where: { emailLogin: { startsWith: 'bia' } } })).toBe(0);
    });

    it('so a administracao do sistema muda o setor da pessoa', async () => {
      const setor = await created('Comunicação');
      const path = `/v1/accounts/${ids[Perfil.NUCLEO_PEDAGOGICO]}/sector`;

      for (const perfil of [Perfil.PRESIDENCIA_GESTAO, Perfil.NUCLEO_PEDAGOGICO]) {
        await as(perfil).patch(path, { setorId: setor.id }).expect(403);
      }
      await as(Perfil.ADMINISTRACAO_SISTEMA)
        .patch(`/v1/accounts/${MISSING}/sector`, { setorId: setor.id })
        .expect(404);
    });
  });
});
