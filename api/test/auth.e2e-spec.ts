import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import argon2 from 'argon2';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import type { ErrorEnvelope } from '../src/common/filters/http-exception.filter.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AutorTipo, Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const SENHA = 'senha longa de quem testa';

describe('Autenticacao (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let passwords: PasswordService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    passwords = app.get(PasswordService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  function http() {
    return request(app.getHttpServer());
  }

  async function createUser(
    emailLogin = 'pessoa@instituto.test',
    data: { ativo?: boolean; senhaHash?: string } = {},
  ) {
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Pessoa de teste' } });
    return prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin,
        senhaHash: data.senhaHash ?? (await passwords.hash(SENHA)),
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        ativo: data.ativo ?? true,
        deveTrocarSenha: false,
      },
    });
  }

  function cookieOf(res: request.Response): string {
    const header = res.headers['set-cookie'] as unknown as string[] | undefined;
    const cookie = header?.find((c) => c.startsWith('session='));
    if (!cookie) throw new Error('cookie de sessao ausente');
    return cookie;
  }

  async function login(email = 'pessoa@instituto.test') {
    const res = await http().post('/v1/auth/login').send({ email, senha: SENHA }).expect(200);
    const body = res.body as { accessToken: string };
    return { accessToken: body.accessToken, cookie: cookieOf(res).split(';')[0] };
  }

  describe('login', () => {
    it('entra, define cookie HttpOnly e SameSite=Strict e registra o acesso', async () => {
      const usuario = await createUser();

      const res = await http()
        .post('/v1/auth/login')
        .send({ email: ' Pessoa@Instituto.test ', senha: SENHA })
        .expect(200);

      expect(res.body).toMatchObject({ perfil: Perfil.NUCLEO_PEDAGOGICO, deveTrocarSenha: false });
      const cookie = cookieOf(res);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/');
      expect(cookie).not.toContain('Secure');
      expect(
        (await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })).ultimoAcessoEm,
      ).not.toBeNull();
      expect(
        await prisma.trilhaAuditoria.findFirst({ where: { acao: 'LOGIN_SUCCEEDED' } }),
      ).toMatchObject({
        autorTipo: AutorTipo.USUARIO,
        usuarioId: usuario.id,
      });
    });

    it('senha errada, e-mail desconhecido e conta desativada recebem a mesma resposta', async () => {
      await createUser();
      await createUser('desativada@instituto.test', { ativo: false });

      const responses = await Promise.all([
        http()
          .post('/v1/auth/login')
          .send({ email: 'pessoa@instituto.test', senha: 'senha errada' }),
        http().post('/v1/auth/login').send({ email: 'ninguem@instituto.test', senha: SENHA }),
        http().post('/v1/auth/login').send({ email: 'desativada@instituto.test', senha: SENHA }),
      ]);

      for (const res of responses) {
        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
          code: 'UNAUTHENTICATED',
          message: 'E-mail ou senha incorretos.',
        });
        expect(res.headers['set-cookie']).toBeUndefined();
      }
      const failures = await prisma.trilhaAuditoria.findMany({ where: { acao: 'LOGIN_FAILED' } });
      expect(failures).toHaveLength(3);
      expect(failures.every((f) => f.autorTipo === AutorTipo.PUBLICO && f.usuarioId === null)).toBe(
        true,
      );
      expect(JSON.stringify(failures)).not.toContain('senha errada');
    });

    it('refaz o hash gravado com parametros antigos', async () => {
      const legacy = await argon2.hash(SENHA, {
        type: argon2.argon2id,
        memoryCost: 4096,
        timeCost: 1,
      });
      const usuario = await createUser('pessoa@instituto.test', { senhaHash: legacy });

      await login();

      const updated = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } });
      expect(updated.senhaHash).not.toBe(legacy);
      expect(passwords.needsRehash(updated.senhaHash)).toBe(false);
      expect(await passwords.verify(updated.senhaHash, SENHA)).toBe(true);
    });
  });

  describe('acesso com o token', () => {
    it('sem credencial ou com token adulterado responde 401', async () => {
      await http().get('/v1/auth/session').expect(401);
      const res = await http()
        .get('/v1/auth/session')
        .set('Authorization', 'Bearer abc.def.ghi')
        .expect(401);
      expect((res.body as ErrorEnvelope).code).toBe('UNAUTHENTICATED');
    });

    it('token valido devolve a sessao com o perfil lido do banco', async () => {
      const usuario = await createUser();
      const { accessToken } = await login();

      const res = await http()
        .get('/v1/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({
        usuarioId: usuario.id,
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: false,
      });
    });

    it.each([
      ['revogada', { revogadaEm: new Date() }],
      ['expirada', { expiraEm: new Date(Date.now() - 1000) }],
      ['inativa ha mais de 30 minutos', { ultimoUsoEm: new Date(Date.now() - 31 * 60_000) }],
    ])('sessao %s responde 401 mesmo com o token dentro da validade', async (_case, data) => {
      await createUser();
      const { accessToken } = await login();
      await prisma.sessao.updateMany({ data });

      await http()
        .get('/v1/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('conta desativada depois do login perde o acesso na requisicao seguinte', async () => {
      const usuario = await createUser();
      const { accessToken } = await login();
      await prisma.usuario.update({ where: { id: usuario.id }, data: { ativo: false } });

      await http()
        .get('/v1/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('renovacao', () => {
    it('exige o header X-CSRF', async () => {
      await createUser();
      const { cookie } = await login();

      const res = await http().post('/v1/auth/refresh').set('Cookie', cookie).expect(403);
      expect((res.body as ErrorEnvelope).code).toBe('FORBIDDEN');
    });

    it('roda o cookie e emite novo acesso sem contar como atividade', async () => {
      await createUser();
      const { cookie } = await login();
      const lastUsed = new Date(Date.now() - 10 * 60_000);
      await prisma.sessao.updateMany({ data: { ultimoUsoEm: lastUsed } });

      const res = await http()
        .post('/v1/auth/refresh')
        .set('Cookie', cookie)
        .set('X-CSRF', '1')
        .expect(200);

      const rotatedCookie = cookieOf(res).split(';')[0];
      expect(rotatedCookie).not.toBe(cookie);
      const body = res.body as { accessToken: string };
      expect(body.accessToken).toEqual(expect.any(String));
      expect((await prisma.sessao.findFirstOrThrow()).ultimoUsoEm).toEqual(lastUsed);
    });

    it('reuso de cookie ja rodado revoga a sessao', async () => {
      await createUser();
      const { cookie } = await login();
      const res = await http()
        .post('/v1/auth/refresh')
        .set('Cookie', cookie)
        .set('X-CSRF', '1')
        .expect(200);
      const rotatedCookie = cookieOf(res).split(';')[0];

      await http().post('/v1/auth/refresh').set('Cookie', cookie).set('X-CSRF', '1').expect(401);

      await http()
        .post('/v1/auth/refresh')
        .set('Cookie', rotatedCookie)
        .set('X-CSRF', '1')
        .expect(401);
      expect((await prisma.sessao.findFirstOrThrow()).revogadaEm).not.toBeNull();
      expect(await prisma.trilhaAuditoria.count({ where: { acao: 'REFRESH_TOKEN_REUSED' } })).toBe(
        1,
      );
    });

    it('sessao inativa nao se renova', async () => {
      await createUser();
      const { cookie } = await login();
      await prisma.sessao.updateMany({ data: { ultimoUsoEm: new Date(Date.now() - 31 * 60_000) } });

      await http().post('/v1/auth/refresh').set('Cookie', cookie).set('X-CSRF', '1').expect(401);
    });
  });

  describe('logout', () => {
    it('revoga a sessao, limpa o cookie e registra na trilha', async () => {
      const usuario = await createUser();
      const { accessToken, cookie } = await login();

      const res = await http()
        .post('/v1/auth/logout')
        .set('Cookie', cookie)
        .set('X-CSRF', '1')
        .expect(204);

      expect(cookieOf(res)).toMatch(/^session=;/);
      expect((await prisma.sessao.findFirstOrThrow()).revogadaEm).not.toBeNull();
      await http()
        .get('/v1/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(await prisma.trilhaAuditoria.findFirst({ where: { acao: 'LOGOUT' } })).toMatchObject({
        usuarioId: usuario.id,
      });
    });
  });
});
