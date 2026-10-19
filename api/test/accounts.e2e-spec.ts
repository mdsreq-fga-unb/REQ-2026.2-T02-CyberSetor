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

interface AccountBody {
  id: string;
  perfil: Perfil;
  ativo: boolean;
  deveTrocarSenha: boolean;
}

describe('Administracao de contas (e2e)', () => {
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

  async function createUser(emailLogin: string, perfil: Perfil): Promise<string> {
    const pessoa = await prisma.pessoa.create({ data: { nome: emailLogin } });
    const usuario = await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin,
        senhaHash: await passwords.hash(PASSWORD),
        perfil,
        deveTrocarSenha: false,
      },
    });
    return usuario.id;
  }

  async function login(email: string, senha = PASSWORD): Promise<string> {
    const res = await http().post('/v1/auth/login').send({ email, senha }).expect(200);
    return (res.body as { accessToken: string }).accessToken;
  }

  async function admin(): Promise<{ id: string; token: string }> {
    const id = await createUser('admin@instituto.test', Perfil.ADMINISTRACAO_SISTEMA);
    return { id, token: await login('admin@instituto.test') };
  }

  it('so a administracao do sistema acessa as rotas de contas', async () => {
    await createUser('gestao@instituto.test', Perfil.PRESIDENCIA_GESTAO);
    const token = await login('gestao@instituto.test');

    await http().get('/v1/accounts').set('Authorization', `Bearer ${token}`).expect(403);
  });

  it('cria conta com senha temporaria exibida uma vez e troca obrigatoria; e-mail repetido e 409', async () => {
    const { token } = await admin();

    const res = await http()
      .post('/v1/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Educadora',
        emailLogin: ' Educadora@Instituto.test ',
        perfil: Perfil.NUCLEO_PEDAGOGICO,
      })
      .expect(201);

    const body = res.body as {
      conta: AccountBody & { emailLogin: string };
      senhaTemporaria: string;
    };
    expect(body.conta).toMatchObject({
      emailLogin: 'educadora@instituto.test',
      perfil: Perfil.NUCLEO_PEDAGOGICO,
      deveTrocarSenha: true,
    });
    expect(body.senhaTemporaria.length).toBeGreaterThanOrEqual(15);
    expect(JSON.stringify(body)).not.toContain('senhaHash');
    const novo = await http()
      .post('/v1/auth/login')
      .send({ email: 'educadora@instituto.test', senha: body.senhaTemporaria })
      .expect(200);
    expect(novo.body).toMatchObject({ deveTrocarSenha: true });

    await http()
      .post('/v1/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Outra',
        emailLogin: 'educadora@instituto.test',
        perfil: Perfil.NUCLEO_PEDAGOGICO,
      })
      .expect(409);

    const list = await http()
      .get('/v1/accounts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((list.body as AccountBody[]).map((c) => c.perfil).sort()).toEqual([
      Perfil.ADMINISTRACAO_SISTEMA,
      Perfil.NUCLEO_PEDAGOGICO,
    ]);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'ACCOUNT_CREATED' } })).toBe(1);
  });

  it('mudanca de perfil revoga as sessoes da conta e vai a trilha com antes e depois', async () => {
    const { id: adminId, token } = await admin();
    const id = await createUser('gestao@instituto.test', Perfil.PRESIDENCIA_GESTAO);
    const userToken = await login('gestao@instituto.test');

    const res = await http()
      .patch(`/v1/accounts/${id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ perfil: Perfil.NUCLEO_PEDAGOGICO })
      .expect(200);

    expect((res.body as AccountBody).perfil).toBe(Perfil.NUCLEO_PEDAGOGICO);
    await http().get('/v1/auth/session').set('Authorization', `Bearer ${userToken}`).expect(401);
    expect(
      await prisma.trilhaAuditoria.findFirst({ where: { acao: 'ACCOUNT_PROFILE_CHANGED' } }),
    ).toMatchObject({
      usuarioId: adminId,
      entidadeId: id,
      antes: { perfil: Perfil.PRESIDENCIA_GESTAO },
      depois: { perfil: Perfil.NUCLEO_PEDAGOGICO },
    });
  });

  it('desativacao revoga sessoes, impede login, informa projetos a reatribuir e se desfaz na reativacao', async () => {
    const { token } = await admin();
    const id = await createUser('coordenacao@instituto.test', Perfil.PRESIDENCIA_GESTAO);
    const userToken = await login('coordenacao@instituto.test');
    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: 'PARCERIA',
        orgaoConcedente: 'Ministerio de teste',
        numeroProcesso: 'P-1',
        valorGlobal: '1000.00',
        dataCelebracao: new Date('2026-01-01'),
        vigenciaInicio: new Date('2026-01-01'),
        vigenciaFim: new Date('2026-12-31'),
      },
    });
    await prisma.projeto.create({
      data: {
        instrumentoId: instrumento.id,
        coordenadorId: id,
        codigo: 'EPG',
        titulo: 'Escola Popular',
        inicio: new Date('2026-01-01'),
        fim: new Date('2026-06-30'),
      },
    });

    const res = await http()
      .post(`/v1/accounts/${id}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ conta: { ativo: false }, projetosCoordenados: 1 });
    await http().get('/v1/auth/session').set('Authorization', `Bearer ${userToken}`).expect(401);
    await http()
      .post('/v1/auth/login')
      .send({ email: 'coordenacao@instituto.test', senha: PASSWORD })
      .expect(401);

    await http()
      .post(`/v1/accounts/${id}/reactivate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await login('coordenacao@instituto.test');
  });

  it('redefinicao gera nova senha temporaria, desbloqueia, revoga sessoes e invalida a senha antiga', async () => {
    const { token } = await admin();
    const id = await createUser('educadora@instituto.test', Perfil.NUCLEO_PEDAGOGICO);
    const userToken = await login('educadora@instituto.test');
    await prisma.usuario.update({
      where: { id },
      data: { falhasLogin: 3, bloqueadoAte: new Date(Date.now() + 600_000) },
    });

    const res = await http()
      .post(`/v1/accounts/${id}/password-reset`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as { conta: AccountBody; senhaTemporaria: string };
    expect(body.conta.deveTrocarSenha).toBe(true);
    expect(await prisma.usuario.findUniqueOrThrow({ where: { id } })).toMatchObject({
      falhasLogin: 0,
      bloqueadoAte: null,
    });
    await http().get('/v1/auth/session').set('Authorization', `Bearer ${userToken}`).expect(401);
    await http()
      .post('/v1/auth/login')
      .send({ email: 'educadora@instituto.test', senha: PASSWORD })
      .expect(401);
    await login('educadora@instituto.test', body.senhaTemporaria);
    const event = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'ACCOUNT_PASSWORD_RESET' },
    });
    expect(JSON.stringify(event)).not.toContain(body.senhaTemporaria);
  });

  it('nao desativa nem rebaixa o ultimo administrador ativo', async () => {
    const { id, token } = await admin();

    const deactivate = await http()
      .post(`/v1/accounts/${id}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
    expect(deactivate.body).toMatchObject({ code: 'LAST_ADMIN' });

    await http()
      .patch(`/v1/accounts/${id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ perfil: Perfil.PRESIDENCIA_GESTAO })
      .expect(409);

    expect(await prisma.usuario.findUniqueOrThrow({ where: { id } })).toMatchObject({
      ativo: true,
      perfil: Perfil.ADMINISTRACAO_SISTEMA,
    });
  });

  it('conta inexistente e 404; identificador invalido e 400', async () => {
    const { token } = await admin();

    await http()
      .post('/v1/accounts/00000000-0000-4000-8000-000000000000/deactivate')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    await http()
      .post('/v1/accounts/nao-e-uuid/deactivate')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
