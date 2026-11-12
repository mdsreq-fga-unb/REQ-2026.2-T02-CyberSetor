import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { Profiles } from '../src/auth/decorators.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { Perfil } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const SENHA = 'senha longa de quem testa';

@Controller('test-routes')
class TestRoutesController {
  @Get('any-profile')
  anyProfile(): { ok: true } {
    return { ok: true };
  }

  @Get('management')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  management(): { ok: true } {
    return { ok: true };
  }
}

describe('Autorizacao (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let passwords: PasswordService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestRoutesController],
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
  });

  afterAll(async () => {
    await app.close();
  });

  function http() {
    return request(app.getHttpServer());
  }

  async function loginAs(perfil: Perfil): Promise<{ id: string; accessToken: string }> {
    const email = `${perfil.toLowerCase()}@instituto.test`;
    const pessoa = await prisma.pessoa.create({ data: { nome: perfil } });
    const usuario = await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin: email,
        senhaHash: await passwords.hash(SENHA),
        perfil,
        deveTrocarSenha: false,
      },
    });
    const res = await http().post('/v1/auth/login').send({ email, senha: SENHA }).expect(200);
    return { id: usuario.id, accessToken: (res.body as { accessToken: string }).accessToken };
  }

  it('rotas sem @Public exigem autenticacao; a saude continua publica', async () => {
    await http().get('/v1/test-routes/any-profile').expect(401);
    await http().get('/v1/health').expect(200);
  });

  it('rota sem @Profiles aceita qualquer perfil autenticado', async () => {
    const { accessToken } = await loginAs(Perfil.CONCEDENTE_AUDITORIA);

    await http()
      .get('/v1/test-routes/any-profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('perfil listado acessa; perfil fora da lista recebe 403 e o acesso negado vai a trilha', async () => {
    const management = await loginAs(Perfil.PRESIDENCIA_GESTAO);
    const admin = await loginAs(Perfil.ADMINISTRACAO_SISTEMA);

    await http()
      .get('/v1/test-routes/management')
      .set('Authorization', `Bearer ${management.accessToken}`)
      .expect(200);
    const res = await http()
      .get('/v1/test-routes/management')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(403);

    expect(res.body).toMatchObject({ code: 'FORBIDDEN' });
    expect(
      await prisma.trilhaAuditoria.findFirst({ where: { acao: 'ACCESS_DENIED' } }),
    ).toMatchObject({
      usuarioId: admin.id,
      entidade: 'rota',
      depois: { metodo: 'GET', rota: '/v1/test-routes/management' },
    });
  });

  it('mudanca de perfil vale na requisicao seguinte, sem novo login', async () => {
    const management = await loginAs(Perfil.PRESIDENCIA_GESTAO);
    await prisma.usuario.update({
      where: { id: management.id },
      data: { perfil: Perfil.NUCLEO_PEDAGOGICO },
    });

    await http()
      .get('/v1/test-routes/management')
      .set('Authorization', `Bearer ${management.accessToken}`)
      .expect(403);
  });
});
