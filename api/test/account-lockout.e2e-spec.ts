import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { LOCKOUT_THRESHOLD } from '../src/auth/login-protection.js';
import { AutorTipo, Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';
const EMAIL = 'pessoa@instituto.test';

describe('Bloqueio temporario por tentativas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let usuarioId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Pessoa de teste' } });
    const usuario = await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin: EMAIL,
        senhaHash: await app.get(PasswordService).hash(PASSWORD),
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: false,
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    await app.close();
  });

  function login(senha: string) {
    return request(app.getHttpServer()).post('/v1/auth/login').send({ email: EMAIL, senha });
  }

  it('bloqueia a conta apos falhas consecutivas, inclusive para a senha correta, com a mesma resposta', async () => {
    for (let i = 0; i < LOCKOUT_THRESHOLD; i++) {
      await login('senha errada de teste').expect(401);
    }

    const res = await login(PASSWORD).expect(401);

    expect(res.body).toMatchObject({ message: 'E-mail ou senha incorretos.' });
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(usuario.bloqueadoAte!.getTime()).toBeGreaterThan(Date.now());
    expect(usuario.falhasLogin).toBe(0);
    expect(
      await prisma.trilhaAuditoria.findFirst({ where: { acao: 'ACCOUNT_LOCKED' } }),
    ).toMatchObject({ autorTipo: AutorTipo.SISTEMA, entidadeId: usuarioId });
  });

  it('passado o prazo do bloqueio, a senha correta entra e zera o contador', async () => {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { bloqueadoAte: new Date(Date.now() - 1000), falhasLogin: LOCKOUT_THRESHOLD - 1 },
    });

    await login(PASSWORD).expect(200);

    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(usuario).toMatchObject({ falhasLogin: 0, bloqueadoAte: null });
  });

  it('falhas abaixo do limite so incrementam o contador', async () => {
    await login('senha errada de teste').expect(401);
    await login('senha errada de teste').expect(401);

    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    expect(usuario).toMatchObject({ falhasLogin: 2, bloqueadoAte: null });
  });
});
