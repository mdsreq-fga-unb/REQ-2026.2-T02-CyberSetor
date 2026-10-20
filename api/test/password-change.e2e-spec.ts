import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const TEMPORARY = 'senha temporaria de teste';
const NEW_PASSWORD = 'nova senha escolhida pela pessoa';

@Controller('protected')
class ProtectedController {
  @Get()
  get(): { ok: true } {
    return { ok: true };
  }
}

describe('Troca obrigatoria de senha (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let passwords: PasswordService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProtectedController],
    }).compile();
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
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Pessoa nova' } });
    await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin: 'nova@instituto.test',
        senhaHash: await passwords.hash(TEMPORARY),
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  function http() {
    return request(app.getHttpServer());
  }

  async function login(password = TEMPORARY): Promise<string> {
    const res = await http()
      .post('/v1/auth/login')
      .send({ email: 'nova@instituto.test', senha: password })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  }

  function changePassword(token: string, body: Record<string, string>) {
    return http().post('/v1/auth/password').set('Authorization', `Bearer ${token}`).send(body);
  }

  it('com troca pendente, so a sessao e a troca respondem; o resto e 403 PASSWORD_CHANGE_REQUIRED', async () => {
    const token = await login();

    const session = await http()
      .get('/v1/auth/session')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(session.body).toMatchObject({ deveTrocarSenha: true });

    const blocked = await http()
      .get('/v1/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(blocked.body).toMatchObject({
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'Troque a senha temporária antes de continuar.',
    });
  });

  it('recusa senha atual errada, nova senha curta e nova igual a atual', async () => {
    const token = await login();

    await changePassword(token, {
      senhaAtual: 'senha errada qualquer',
      novaSenha: NEW_PASSWORD,
    }).expect(400);
    await changePassword(token, { senhaAtual: TEMPORARY, novaSenha: 'curta' }).expect(400);
    await changePassword(token, { senhaAtual: TEMPORARY, novaSenha: TEMPORARY }).expect(400);

    expect((await prisma.usuario.findFirstOrThrow()).deveTrocarSenha).toBe(true);
  });

  it('troca a senha, libera o acesso, revoga as outras sessoes e registra na trilha', async () => {
    const other = await login();
    const token = await login();

    await changePassword(token, { senhaAtual: TEMPORARY, novaSenha: NEW_PASSWORD }).expect(204);

    const usuario = await prisma.usuario.findFirstOrThrow();
    expect(usuario.deveTrocarSenha).toBe(false);
    expect(await passwords.verify(usuario.senhaHash, NEW_PASSWORD)).toBe(true);
    await http().get('/v1/protected').set('Authorization', `Bearer ${token}`).expect(200);
    await http().get('/v1/auth/session').set('Authorization', `Bearer ${other}`).expect(401);
    await http()
      .post('/v1/auth/login')
      .send({ email: 'nova@instituto.test', senha: TEMPORARY })
      .expect(401);

    const event = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'PASSWORD_CHANGED' },
    });
    expect(event).toMatchObject({ usuarioId: usuario.id, depois: { deveTrocarSenha: false } });
    expect(JSON.stringify(event)).not.toContain(NEW_PASSWORD);
  });
});
