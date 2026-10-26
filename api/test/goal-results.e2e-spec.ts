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

interface ResultBody {
  id: string;
  dataReferencia: string;
  descricao: string;
  valorAlcancado: number | null;
  parametroPlanejado: number | null;
  percentual: number | null;
  alcance: string;
  registradoPor: { id: string; nome: string };
}

interface GoalBody {
  id: string;
  versao: number;
  parametroPlanejado: string | null;
  rascunho: boolean;
  camposFaltantes: string[];
  resultado: ResultBody | null;
}

interface ErrorBody {
  code: string;
}

function brasilia(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(Date.now() + offsetDays * DAY),
  );
}

describe('Resultado alcançado da meta e parâmetro planejado numérico (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let outraEducadora: string;
  let instrumentoId: string;
  let projetoId: string;
  let requisitoId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await passwords.hash(PASSWORD);
    const login = async (emailLogin: string) => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      return (res.body as { accessToken: string }).accessToken;
    };
    const account = async (nome: string, emailLogin: string, perfil: Perfil) => {
      const pessoa = await prisma.pessoa.create({ data: { nome } });
      const usuario = await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      return { id: usuario.id, token: await login(emailLogin) };
    };
    for (const perfil of Object.values(Perfil)) {
      const conta = await account(perfil, `${perfil.toLowerCase()}@instituto.test`, perfil);
      ids[perfil] = conta.id;
      tokens[perfil] = conta.token;
    }
    outraEducadora = (
      await account('Outra Educadora', 'outra@instituto.test', Perfil.NUCLEO_PEDAGOGICO)
    ).token;
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
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

  function goalBody(body: object = {}): object {
    return {
      origem: 'EDITAL',
      objetivo: 'Promover a formação artística de jovens',
      descricao: 'Oficinas de dança com 120 participantes',
      requisitoIds: [requisitoId],
      indicador: 'Participantes com frequência mínima de 70%',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '120',
      unidade: 'participantes',
      periodoInicio: '2025-02-01',
      periodoFim: '2030-06-30',
      formaComprovacao: 'Listas de presença',
      responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      ...body,
    };
  }

  async function goal(body: object = {}): Promise<GoalBody> {
    const res = await gestao().post(`/v1/projects/${projetoId}/goals`, goalBody(body)).expect(201);
    return res.body as GoalBody;
  }

  function record(token: string, id: string, body: object) {
    return as(token).post(`/v1/goals/${id}/results`, body);
  }

  describe('parâmetro planejado', () => {
    it('na meta quantitativa e numero maior que zero, com virgula ou ponto', async () => {
      const meta = await goal({ parametroPlanejado: '12,5' });
      expect(meta.parametroPlanejado).toBe('12.5');

      for (const parametroPlanejado of ['cento e vinte', '0', '12,555']) {
        const res = await gestao()
          .post(`/v1/projects/${projetoId}/goals`, goalBody({ parametroPlanejado }))
          .expect(400);
        expect((res.body as ErrorBody).code).toBe('INVALID_PLANNED_VALUE');
      }
      await goal({ modalidadeAfericao: 'QUALITATIVA', parametroPlanejado: 'Apresentação pública' });
    });

    it('meta quantitativa sem parametro fica em rascunho; a qualitativa nao', async () => {
      const quantitativa = await goal({ parametroPlanejado: null });
      expect(quantitativa).toMatchObject({
        rascunho: true,
        camposFaltantes: ['parametroPlanejado'],
      });
      const qualitativa = await goal({
        modalidadeAfericao: 'QUALITATIVA',
        parametroPlanejado: null,
      });
      expect(qualitativa).toMatchObject({ rascunho: false, camposFaltantes: [] });
    });

    it('editar outro campo nao recusa parametro antigo em texto; mudar o parametro recusa', async () => {
      const meta = await goal();
      await prisma.meta.update({
        where: { id: meta.id },
        data: { parametroPlanejado: 'cento e vinte' },
      });

      await gestao()
        .patch(`/v1/goals/${meta.id}`, { versao: 1, objetivo: 'Outro objetivo' })
        .expect(200);
      const recusa = await gestao()
        .patch(`/v1/goals/${meta.id}`, { versao: 2, parametroPlanejado: 'cem' })
        .expect(400);
      expect((recusa.body as ErrorBody).code).toBe('INVALID_PLANNED_VALUE');
    });
  });

  describe('resultado alcançado', () => {
    it('na meta quantitativa, o percentual e a classificacao sao calculados e ficam na trilha', async () => {
      const meta = await goal();

      const parcial = await record(tokens[Perfil.NUCLEO_PEDAGOGICO], meta.id, {
        dataReferencia: brasilia(-30),
        descricao: '84 jovens concluíram com frequência mínima.',
        valorAlcancado: 84,
      }).expect(201);
      expect(parcial.body).toMatchObject({
        valorAlcancado: 84,
        parametroPlanejado: 120,
        percentual: 70,
        alcance: 'PARCIALMENTE_CUMPRIDA',
        registradoPor: { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: Perfil.NUCLEO_PEDAGOGICO },
      });
      const superada = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(0),
        descricao: 'Turma extra aberta no segundo semestre.',
        valorAlcancado: 150,
      }).expect(201);
      expect(superada.body).toMatchObject({ percentual: 125, alcance: 'CUMPRIDA' });
      const nenhum = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(-60),
        descricao: 'Oficinas ainda não começaram.',
        valorAlcancado: 0,
      }).expect(201);
      expect(nenhum.body).toMatchObject({ percentual: 0, alcance: 'NAO_CUMPRIDA' });

      const lista = await gestao().get(`/v1/goals/${meta.id}/results`).expect(200);
      expect((lista.body as ResultBody[]).map((r) => r.percentual)).toEqual([125, 70, 0]);
      const metas = await gestao().get(`/v1/projects/${projetoId}/goals`).expect(200);
      expect((metas.body as GoalBody[])[0].resultado).toMatchObject({
        percentual: 125,
        alcance: 'CUMPRIDA',
      });
      const trilha = await prisma.trilhaAuditoria.findMany({
        where: { entidadeId: meta.id, acao: 'GOAL_RESULT_RECORDED' },
        orderBy: { criadoEm: 'asc' },
      });
      expect(trilha).toHaveLength(3);
      expect(trilha[0]).toMatchObject({
        usuarioId: ids[Perfil.NUCLEO_PEDAGOGICO],
        depois: {
          dataReferencia: brasilia(-30),
          valorAlcancado: 84,
          percentual: 70,
          alcance: 'PARCIALMENTE_CUMPRIDA',
        },
      });
    });

    it('na meta qualitativa, a classificacao e informada, sem valor nem percentual', async () => {
      const meta = await goal({ modalidadeAfericao: 'QUALITATIVA', parametroPlanejado: null });

      const res = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(0),
        descricao: 'Apresentação pública realizada com as três turmas.',
        alcance: 'CUMPRIDA',
      }).expect(201);
      expect(res.body).toMatchObject({
        valorAlcancado: null,
        parametroPlanejado: null,
        percentual: null,
        alcance: 'CUMPRIDA',
      });
      for (const body of [{ alcance: 'CUMPRIDA', valorAlcancado: 3 }, {}]) {
        const recusa = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
          dataReferencia: brasilia(0),
          descricao: 'x',
          ...body,
        }).expect(400);
        expect((recusa.body as ErrorBody).code).toBe('RESULT_REACH_REQUIRED');
      }
    });

    it('recusa classificacao informada ou valor ausente na quantitativa, data futura ou inexistente e meta em rascunho', async () => {
      const meta = await goal();
      for (const body of [{ valorAlcancado: 84, alcance: 'CUMPRIDA' }, {}]) {
        const res = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
          dataReferencia: brasilia(0),
          descricao: 'x',
          ...body,
        }).expect(400);
        expect((res.body as ErrorBody).code).toBe('RESULT_VALUE_REQUIRED');
      }
      const futura = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(2),
        descricao: 'x',
        valorAlcancado: 1,
      }).expect(400);
      expect((futura.body as ErrorBody).code).toBe('FUTURE_REFERENCE_DATE');
      await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: '2026-02-30',
        descricao: 'x',
        valorAlcancado: 1,
      }).expect(400);
      await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(0),
        descricao: 'x',
        valorAlcancado: 1.234,
      }).expect(400);

      const rascunho = await goal({ formaComprovacao: null });
      const res = await record(tokens[Perfil.PRESIDENCIA_GESTAO], rascunho.id, {
        dataReferencia: brasilia(0),
        descricao: 'x',
        valorAlcancado: 1,
      }).expect(400);
      expect((res.body as ErrorBody).code).toBe('GOAL_DRAFT');
      expect(await prisma.resultadoMeta.count()).toBe(0);
    });

    it('so a gestao e quem responde pela meta registram; os leitores consultam', async () => {
      const meta = await goal();
      const body = { dataReferencia: brasilia(0), descricao: 'x', valorAlcancado: 10 };

      const alheia = await record(outraEducadora, meta.id, body).expect(403);
      expect((alheia.body as ErrorBody).code).toBe('NOT_GOAL_OWNER');
      expect(
        await prisma.trilhaAuditoria.findFirst({
          where: { acao: 'ACCESS_DENIED', entidadeId: meta.id },
        }),
      ).toMatchObject({ depois: { operacao: 'GOAL_RESULT' } });
      await record(tokens[Perfil.ADMINISTRATIVO_FINANCEIRO], meta.id, body).expect(403);
      await record(tokens[Perfil.CONCEDENTE_AUDITORIA], meta.id, body).expect(403);
      await record(tokens[Perfil.NUCLEO_PEDAGOGICO], meta.id, body).expect(201);

      await as(tokens[Perfil.ADMINISTRATIVO_FINANCEIRO])
        .get(`/v1/goals/${meta.id}/results`)
        .expect(200);
      await as(tokens[Perfil.CONCEDENTE_AUDITORIA]).get(`/v1/goals/${meta.id}/results`).expect(403);
    });

    it('instrumento inativo recusa o registro; meta inexistente responde 404', async () => {
      const meta = await goal();
      await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

      const res = await record(tokens[Perfil.PRESIDENCIA_GESTAO], meta.id, {
        dataReferencia: brasilia(0),
        descricao: 'x',
        valorAlcancado: 1,
      }).expect(409);
      expect((res.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
      await record(tokens[Perfil.PRESIDENCIA_GESTAO], MISSING, {
        dataReferencia: brasilia(0),
        descricao: 'x',
        valorAlcancado: 1,
      }).expect(404);
      await gestao().get(`/v1/goals/${MISSING}/results`).expect(404);
    });
  });
});
