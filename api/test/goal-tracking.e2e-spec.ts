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
const DAY = 24 * 60 * 60 * 1000;

interface GoalBody {
  id: string;
  versao: number;
  responsavel: { id: string; nome: string; ativo: boolean } | null;
  setor: { id: string; nome: string; ativo: boolean } | null;
  situacao: string;
  alertaPrazo: string | null;
}

interface ErrorBody {
  code: string;
  message: string;
}

function brasilia(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(Date.now() + offsetDays * DAY),
  );
}

describe('Responsável, setor, situação e prazo da meta (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let segundoNucleo: { id: string; token: string };
  let desativadaId: string;
  let instrumentoId: string;
  let projetoId: string;
  let requisitoId: string;
  let pedagogica: string;
  let execucao: string;

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
    pedagogica = (await prisma.setor.create({ data: { nome: 'Coordenação Pedagógica' } })).id;
    execucao = (await prisma.setor.create({ data: { nome: 'Coordenação de Execução' } })).id;
    const senhaHash = await passwords.hash(PASSWORD);
    const login = async (emailLogin: string) => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      return (res.body as { accessToken: string }).accessToken;
    };
    for (const perfil of Object.values(Perfil)) {
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      const pessoa = await prisma.pessoa.create({
        data: {
          nome: perfil,
          setorId: perfil === Perfil.NUCLEO_PEDAGOGICO ? pedagogica : null,
        },
      });
      const usuario = await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      ids[perfil] = usuario.id;
      tokens[perfil] = await login(emailLogin);
    }
    const outra = await prisma.pessoa.create({ data: { nome: 'Outra Educadora' } });
    const outraConta = await prisma.usuario.create({
      data: {
        pessoaId: outra.id,
        emailLogin: 'outra@instituto.test',
        senhaHash,
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: false,
      },
    });
    segundoNucleo = { id: outraConta.id, token: await login('outra@instituto.test') };
    const desativada = await prisma.pessoa.create({ data: { nome: 'Fábio Desativado' } });
    desativadaId = (
      await prisma.usuario.create({
        data: {
          pessoaId: desativada.id,
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
    await prisma.setor.updateMany({ data: { ativo: true } });
    instrumentoId = (
      await prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.PARCERIA,
          orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
          numeroProcesso: '71000.057425/2025-03',
          valorGlobal: '300000.00',
          dataCelebracao: new Date('2025-11-07T00:00:00.000Z'),
          vigenciaInicio: new Date('2025-01-01T00:00:00.000Z'),
          vigenciaFim: new Date('2030-12-31T00:00:00.000Z'),
        },
      })
    ).id;
    projetoId = (
      await prisma.projeto.create({
        data: {
          instrumentoId,
          coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO],
          codigo: 'P01',
          titulo: 'Oficinas de dança',
          inicio: new Date('2025-01-05T00:00:00.000Z'),
          fim: new Date('2030-12-20T00:00:00.000Z'),
        },
      })
    ).id;
    requisitoId = (
      await prisma.requisitoInstrumento.create({
        data: { instrumentoId, descricao: 'Frequência mínima de 70%' },
      })
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  function as(token: string) {
    const server = request(app.getHttpServer());
    const auth = `Bearer ${token}`;
    return {
      get: (path: string) => server.get(path).set('Authorization', auth),
      post: (path: string, body: object) => server.post(path).set('Authorization', auth).send(body),
      patch: (path: string, body: object) =>
        server.patch(path).set('Authorization', auth).send(body),
    };
  }

  const gestao = () => as(tokens[Perfil.PRESIDENCIA_GESTAO]);

  async function goal(body: object = {}): Promise<GoalBody> {
    const res = await gestao()
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: 'EDITAL',
        objetivo: 'Promover a formação artística de jovens',
        descricao: 'Oficinas de dança com 120 participantes',
        requisitoIds: [requisitoId],
        ...body,
      })
      .expect(201);
    return res.body as GoalBody;
  }

  function situation(token: string, id: string, body: object) {
    return as(token).patch(`/v1/goals/${id}/situation`, body);
  }

  it('cadastra a meta com responsavel e setor executor, pendente, e grava na trilha', async () => {
    const meta = await goal({
      responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      setorId: pedagogica,
    });

    expect(meta).toMatchObject({
      responsavel: { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: 'NUCLEO_PEDAGOGICO', ativo: true },
      setor: { id: pedagogica, nome: 'Coordenação Pedagógica', ativo: true },
      situacao: 'PENDENTE',
      alertaPrazo: null,
    });
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: meta.id, acao: 'GOAL_CREATED' },
    });
    expect(trilha.depois).toMatchObject({
      responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      setorId: pedagogica,
      situacao: 'PENDENTE',
    });
    const lista = await gestao().get(`/v1/projects/${projetoId}/goals`).expect(200);
    expect(lista.body).toEqual([meta]);
  });

  it('meta sem responsavel nem setor fica com os dois nulos', async () => {
    const meta = await goal();

    expect(meta).toMatchObject({ responsavel: null, setor: null, situacao: 'PENDENTE' });
  });

  it('troca e tira responsavel e setor, com a trilha so do que mudou', async () => {
    const meta = await goal({ responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO], setorId: pedagogica });
    const path = `/v1/goals/${meta.id}`;

    const troca = await gestao()
      .patch(path, {
        versao: 1,
        responsavelId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO],
        setorId: execucao,
      })
      .expect(200);
    expect(troca.body).toMatchObject({
      versao: 2,
      responsavel: { id: ids[Perfil.ADMINISTRATIVO_FINANCEIRO] },
      setor: { id: execucao },
    });
    const retirada = await gestao()
      .patch(path, { versao: 2, responsavelId: null, setorId: null })
      .expect(200);
    expect(retirada.body).toMatchObject({ versao: 3, responsavel: null, setor: null });

    const eventos = await prisma.trilhaAuditoria.findMany({
      where: { entidadeId: meta.id, acao: 'GOAL_UPDATED' },
      orderBy: { criadoEm: 'asc' },
    });
    expect(eventos.map((evento) => [evento.antes, evento.depois])).toEqual([
      [
        { responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO], setorId: pedagogica },
        { responsavelId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO], setorId: execucao },
      ],
      [
        { responsavelId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO], setorId: execucao },
        { responsavelId: null, setorId: null },
      ],
    ]);
  });

  it('recusa responsavel inexistente, desativado ou de perfil sem metas, e setor invalido', async () => {
    for (const responsavelId of [
      MISSING,
      desativadaId,
      ids[Perfil.CONCEDENTE_AUDITORIA],
      ids[Perfil.ADMINISTRACAO_SISTEMA],
    ]) {
      const res = await gestao()
        .post(`/v1/projects/${projetoId}/goals`, {
          origem: 'EDITAL',
          objetivo: 'x',
          descricao: 'x',
          requisitoIds: [requisitoId],
          responsavelId,
        })
        .expect(400);
      expect((res.body as ErrorBody).code).toBe('INVALID_OWNER');
    }
    await prisma.setor.update({ where: { id: execucao }, data: { ativo: false } });
    for (const setorId of [MISSING, execucao]) {
      const res = await gestao()
        .post(`/v1/projects/${projetoId}/goals`, {
          origem: 'EDITAL',
          objetivo: 'x',
          descricao: 'x',
          requisitoIds: [requisitoId],
          setorId,
        })
        .expect(400);
      expect((res.body as ErrorBody).code).toBe('INVALID_SECTOR');
    }
    expect(await prisma.meta.count()).toBe(0);
  });

  it('responsavel desativado e setor desativado so sao conferidos quando mudam', async () => {
    const meta = await goal({ responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO], setorId: execucao });
    await prisma.meta.update({ where: { id: meta.id }, data: { responsavelId: desativadaId } });
    await prisma.setor.update({ where: { id: execucao }, data: { ativo: false } });

    const res = await gestao()
      .patch(`/v1/goals/${meta.id}`, { versao: 1, objetivo: 'Outro objetivo' })
      .expect(200);
    expect(res.body).toMatchObject({
      responsavel: { id: desativadaId, ativo: false },
      setor: { id: execucao, ativo: false },
    });
    await gestao()
      .patch(`/v1/goals/${meta.id}`, { versao: 2, setorId: execucao, responsavelId: desativadaId })
      .expect(200);
  });

  it('a situacao nao muda pela edicao geral', async () => {
    const meta = await goal();

    await gestao().patch(`/v1/goals/${meta.id}`, { versao: 1, situacao: 'CONCLUIDA' }).expect(400);
    await gestao()
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: 'EDITAL',
        objetivo: 'x',
        descricao: 'x',
        requisitoIds: [requisitoId],
        situacao: 'CONCLUIDA',
      })
      .expect(400);
  });

  it('a gestao muda a situacao com a versao lida, com trilha; versao antiga e 409', async () => {
    const meta = await goal();

    const res = await situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
      versao: 1,
      situacao: 'EM_ANDAMENTO',
    }).expect(200);
    expect(res.body).toMatchObject({ versao: 2, situacao: 'EM_ANDAMENTO' });
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: meta.id, acao: 'GOAL_UPDATED' },
    });
    expect(trilha).toMatchObject({
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      antes: { situacao: 'PENDENTE' },
      depois: { situacao: 'EM_ANDAMENTO' },
    });

    const conflito = await situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
      versao: 1,
      situacao: 'CONCLUIDA',
    }).expect(409);
    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');
    const igual = await situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
      versao: 2,
      situacao: 'EM_ANDAMENTO',
    }).expect(200);
    expect((igual.body as GoalBody).versao).toBe(2);
    await situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
      versao: 2,
      situacao: 'ATRASADA',
    }).expect(400);
  });

  it('duas mudancas de situacao simultaneas da mesma versao: uma grava, a outra recebe 409', async () => {
    const meta = await goal();

    const respostas = await Promise.all(
      ['EM_ANDAMENTO', 'CONCLUIDA'].map((situacao) =>
        situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, { versao: 1, situacao }),
      ),
    );

    expect(respostas.map((res) => res.status).sort()).toEqual([200, 409]);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'GOAL_UPDATED' } })).toBe(1);
  });

  it('quem responde pela meta muda a situacao dela; outra pessoa do mesmo perfil nao', async () => {
    const meta = await goal({ responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO] });

    const propria = await situation(tokens[Perfil.NUCLEO_PEDAGOGICO], meta.id, {
      versao: 1,
      situacao: 'CONCLUIDA',
    }).expect(200);
    expect((propria.body as GoalBody).situacao).toBe('CONCLUIDA');

    const alheia = await situation(segundoNucleo.token, meta.id, {
      versao: 2,
      situacao: 'PENDENTE',
    }).expect(403);
    expect((alheia.body as ErrorBody).code).toBe('NOT_GOAL_OWNER');
    const negado = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'ACCESS_DENIED', usuarioId: segundoNucleo.id },
    });
    expect(negado).toMatchObject({ entidade: 'meta', entidadeId: meta.id });

    await as(tokens[Perfil.NUCLEO_PEDAGOGICO])
      .patch(`/v1/goals/${meta.id}`, { versao: 2, objetivo: 'x' })
      .expect(403);
    await situation(tokens[Perfil.CONCEDENTE_AUDITORIA], meta.id, {
      versao: 2,
      situacao: 'PENDENTE',
    }).expect(403);
    await request(app.getHttpServer())
      .patch(`/v1/goals/${meta.id}/situation`)
      .send({ versao: 2, situacao: 'PENDENTE' })
      .expect(401);
    expect((await prisma.meta.findUniqueOrThrow({ where: { id: meta.id } })).situacao).toBe(
      'CONCLUIDA',
    );
  });

  it('instrumento inativo e meta inexistente tambem valem para a situacao', async () => {
    const meta = await goal();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const inativo = await situation(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
      versao: 1,
      situacao: 'CONCLUIDA',
    }).expect(409);
    expect((inativo.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    await situation(tokens[Perfil.PRESIDENCIA_GESTAO], MISSING, {
      versao: 1,
      situacao: 'CONCLUIDA',
    }).expect(404);
  });

  it('alerta de prazo: vencendo em ate 30 dias, vencida, e nada depois de concluida', async () => {
    const vencendo = await goal({ periodoInicio: brasilia(-10), periodoFim: brasilia(30) });
    const longe = await goal({ periodoInicio: brasilia(-10), periodoFim: brasilia(31) });
    const vencida = await goal({ periodoInicio: brasilia(-10), periodoFim: brasilia(-1) });
    const semPrazo = await goal();

    expect([vencendo, longe, vencida, semPrazo].map((meta) => meta.alertaPrazo)).toEqual([
      'VENCENDO',
      null,
      'VENCIDA',
      null,
    ]);
    const concluida = await situation(tokens[Perfil.PRESIDENCIA_GESTAO], vencida.id, {
      versao: 1,
      situacao: 'CONCLUIDA',
    }).expect(200);
    expect((concluida.body as GoalBody).alertaPrazo).toBeNull();
  });

  it('lista de responsaveis possiveis: contas ativas dos tres perfis, com setor, so para a gestao', async () => {
    const res = await gestao().get('/v1/goals/eligible-owners').expect(200);

    expect(res.body).toEqual([
      { id: ids[Perfil.ADMINISTRATIVO_FINANCEIRO], nome: 'ADMINISTRATIVO_FINANCEIRO', setor: null },
      {
        id: ids[Perfil.NUCLEO_PEDAGOGICO],
        nome: 'NUCLEO_PEDAGOGICO',
        setor: { id: pedagogica, nome: 'Coordenação Pedagógica' },
      },
      { id: segundoNucleo.id, nome: 'Outra Educadora', setor: null },
      { id: ids[Perfil.PRESIDENCIA_GESTAO], nome: 'PRESIDENCIA_GESTAO', setor: null },
    ]);
    await as(tokens[Perfil.NUCLEO_PEDAGOGICO]).get('/v1/goals/eligible-owners').expect(403);
  });
});
