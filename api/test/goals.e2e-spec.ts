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

interface GoalBody {
  id: string;
  versao: number;
  projetoId: string;
  ordem: number;
  origem: string;
  objetivo: string;
  descricao: string;
  indicador: string | null;
  modalidadeAfericao: string | null;
  parametroPlanejado: string | null;
  unidade: string | null;
  periodoInicio: string | null;
  periodoFim: string | null;
  frequenciaApuracao: string | null;
  formaComprovacao: string | null;
  resultadoEsperado: string | null;
  requisitos: { id: string; referencia: string | null; descricao: string }[];
  rascunho: boolean;
  camposFaltantes: string[];
}

interface ErrorBody {
  code: string;
  message: string;
  details: { errors?: string[] };
}

describe('Metas do projeto (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;
  let projetoId: string;
  let frequencia: string;
  let certificado: string;

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
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    instrumentoId = await instrument();
    projetoId = await project(instrumentoId);
    frequencia = await requirement(instrumentoId, 'Frequência mínima de 70%', 'TR, item 24.1');
    certificado = await requirement(instrumentoId, 'Certificado para quem concluir', null);
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
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
        numeroProcesso: '71000.057425/2025-03',
        valorGlobal: '300000.00',
        dataCelebracao: new Date('2025-11-07T00:00:00.000Z'),
        vigenciaInicio: new Date('2025-12-31T00:00:00.000Z'),
        vigenciaFim: new Date('2026-07-26T00:00:00.000Z'),
        ativo,
      },
    });
    return row.id;
  }

  async function project(id: string, codigo = 'P01'): Promise<string> {
    const row = await prisma.projeto.create({
      data: {
        instrumentoId: id,
        coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO],
        codigo,
        titulo: 'Oficinas de dança no Setor Comercial Sul',
        inicio: new Date('2026-01-05T00:00:00.000Z'),
        fim: new Date('2026-07-20T00:00:00.000Z'),
      },
    });
    return row.id;
  }

  async function requirement(
    id: string,
    descricao: string,
    referencia: string | null,
  ): Promise<string> {
    const row = await prisma.requisitoInstrumento.create({
      data: { instrumentoId: id, descricao, referencia },
    });
    return row.id;
  }

  function parameters(): Record<string, unknown> {
    return {
      indicador: 'Participantes com frequência mínima de 70%',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '120',
      unidade: 'participantes',
      periodoInicio: '2026-01-05',
      periodoFim: '2026-06-30',
      frequenciaApuracao: 'Mensal',
      formaComprovacao: 'Listas de presença e relatório fotográfico',
      resultadoEsperado: 'Jovens certificados em dança contemporânea',
    };
  }

  function complete(): Record<string, unknown> {
    return {
      origem: 'EDITAL',
      objetivo: 'Promover a formação artística de jovens do Setor Comercial Sul',
      descricao: 'Realizar oficinas de dança com 120 participantes',
      requisitoIds: [certificado, frequencia],
      ...parameters(),
    };
  }

  function draft(): Record<string, unknown> {
    return {
      origem: 'PROJETO',
      objetivo: 'Promover a formação artística de jovens',
      descricao: 'Apresentação pública ao fim das oficinas',
      requisitoIds: [frequencia],
    };
  }

  function post(body: object, id = projetoId) {
    return as(Perfil.PRESIDENCIA_GESTAO).post(`/v1/projects/${id}/goals`, body);
  }

  function patch(id: string, body: object) {
    return as(Perfil.PRESIDENCIA_GESTAO).patch(`/v1/goals/${id}`, body);
  }

  async function created(body: object = complete(), id = projetoId): Promise<GoalBody> {
    const res = await post(body, id).expect(201);
    return res.body as GoalBody;
  }

  async function nothingSaved(): Promise<void> {
    expect(await prisma.meta.count()).toBe(0);
    expect(await prisma.metaRequisito.count()).toBe(0);
    expect(await prisma.trilhaAuditoria.count()).toBe(0);
  }

  it('cadastra a meta com os parametros de afericao e os requisitos, e grava a trilha', async () => {
    const meta = await created({ ...complete(), indicador: '  Participantes certificados  ' });

    expect(meta).toMatchObject({
      versao: 1,
      projetoId,
      ordem: 1,
      origem: 'EDITAL',
      indicador: 'Participantes certificados',
      modalidadeAfericao: 'QUANTITATIVA',
      parametroPlanejado: '120',
      unidade: 'participantes',
      periodoInicio: '2026-01-05',
      periodoFim: '2026-06-30',
      frequenciaApuracao: 'Mensal',
      formaComprovacao: 'Listas de presença e relatório fotográfico',
      resultadoEsperado: 'Jovens certificados em dança contemporânea',
      rascunho: false,
      camposFaltantes: [],
    });
    expect(meta.requisitos).toEqual([
      { id: frequencia, referencia: 'TR, item 24.1', descricao: 'Frequência mínima de 70%' },
      { id: certificado, referencia: null, descricao: 'Certificado para quem concluir' },
    ]);
    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: meta.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'GOAL_CREATED',
      entidade: 'meta',
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: expect.objectContaining({
        projetoId,
        ordem: 1,
        indicador: 'Participantes certificados',
        requisitoIds: [certificado, frequencia].sort(),
      }) as unknown,
    });

    const lista = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/goals`)
      .expect(200);
    expect(lista.body).toEqual([meta]);
  });

  it('numera as metas por projeto e lista na ordem', async () => {
    const primeira = await created();
    const segunda = await created(draft());
    const outroProjeto = await created(draft(), await project(instrumentoId, 'P02'));

    expect([primeira.ordem, segunda.ordem, outroProjeto.ordem]).toEqual([1, 2, 1]);
    const lista = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/goals`)
      .expect(200);
    expect((lista.body as GoalBody[]).map((meta) => meta.id)).toEqual([primeira.id, segunda.id]);
  });

  it('liga o mesmo requisito a mais de uma meta', async () => {
    await created();
    await created(draft());

    expect(await prisma.metaRequisito.count({ where: { requisitoId: frequencia } })).toBe(2);
  });

  it('meta sem indicador, comprovacao ou periodo fica como rascunho, e sai dele ao completar', async () => {
    const meta = await created(draft());
    expect(meta).toMatchObject({
      rascunho: true,
      camposFaltantes: ['indicador', 'formaComprovacao', 'periodoInicio', 'periodoFim'],
    });

    const completa = await patch(meta.id, { versao: 1, ...parameters() }).expect(200);
    expect(completa.body).toMatchObject({ versao: 2, rascunho: false, camposFaltantes: [] });

    const semIndicador = await patch(meta.id, { versao: 2, indicador: '' }).expect(200);
    expect(semIndicador.body).toMatchObject({
      versao: 3,
      indicador: null,
      rascunho: true,
      camposFaltantes: ['indicador'],
    });
    const semFim = await patch(meta.id, {
      versao: 3,
      indicador: 'x',
      periodoFim: null,
    }).expect(200);
    expect(semFim.body).toMatchObject({ rascunho: true, camposFaltantes: ['periodoFim'] });
  });

  it.each([
    ['origem', { origem: 'FINANCIADOR' }],
    ['objetivo', { objetivo: '   ' }],
    ['descricao', { descricao: undefined }],
    ['requisitoIds', { requisitoIds: 'todos' }],
    ['requisitoIds', { requisitoIds: ['frequencia'] }],
    ['modalidadeAfericao', { modalidadeAfericao: 'NUMERICA' }],
    ['periodoInicio', { periodoInicio: '05/01/2026' }],
    ['indicador', { indicador: 'x'.repeat(501) }],
    ['formaComprovacao', { formaComprovacao: 'x'.repeat(1001) }],
  ])('recusa %s invalido com 400 e indica o campo', async (campo, change) => {
    const res = await post({ ...complete(), ...change }).expect(400);

    const { details } = res.body as ErrorBody;
    expect(details.errors?.some((message) => message.includes(campo))).toBe(true);
    await nothingSaved();
  });

  it('recusa data inexistente, requisito repetido e campo desconhecido com 400', async () => {
    await post({ ...complete(), periodoFim: '2026-02-30' }).expect(400);
    await post({ ...complete(), requisitoIds: [frequencia, frequencia] }).expect(400);
    await post({ ...complete(), ordem: 7 }).expect(400);
    await nothingSaved();
  });

  it('recusa meta sem requisito do instrumento, de qualquer origem', async () => {
    for (const body of [
      { ...draft(), origem: 'EDITAL', requisitoIds: [] },
      { ...draft(), origem: 'PROJETO', requisitoIds: undefined },
      { ...draft(), origem: 'INSTITUTO', requisitoIds: [] },
    ]) {
      const res = await post(body).expect(400);
      expect((res.body as ErrorBody).code).toBe('GOAL_REQUIREMENT_REQUIRED');
    }
    await nothingSaved();
  });

  it('recusa requisito de outro instrumento ou inexistente, sem gravar nada', async () => {
    const alheio = await requirement(await instrument(), 'Requisito de outro termo', null);

    for (const requisitoIds of [
      [frequencia, alheio],
      [MISSING, frequencia],
    ]) {
      const res = await post({ ...complete(), requisitoIds }).expect(400);
      expect((res.body as ErrorBody).code).toBe('REQUIREMENT_OUTSIDE_INSTRUMENT');
    }
    await nothingSaved();
  });

  it('recusa periodo com fim antes do inicio, no cadastro e na edicao', async () => {
    const cadastro = await post({ ...complete(), periodoFim: '2026-01-04' }).expect(400);
    expect((cadastro.body as ErrorBody).code).toBe('INVALID_PERIOD');

    const meta = await created();
    const edicao = await patch(meta.id, { versao: 1, periodoInicio: '2026-07-01' }).expect(400);
    expect((edicao.body as ErrorBody).code).toBe('INVALID_PERIOD');
    await created({ ...complete(), periodoInicio: '2026-03-01', periodoFim: '2026-03-01' });
  });

  it('recusa periodo fora da execucao do projeto, no cadastro e na edicao', async () => {
    const antes = await post({ ...complete(), periodoInicio: '2026-01-04' }).expect(400);
    expect(antes.body).toMatchObject({
      code: 'OUTSIDE_PROJECT_EXECUTION',
      message:
        'O período da meta deve ficar dentro da execução do projeto, de 05/01/2026 a 20/07/2026.',
    });
    const rascunho = await post({ ...draft(), periodoFim: '2026-07-21' }).expect(400);
    expect((rascunho.body as ErrorBody).code).toBe('OUTSIDE_PROJECT_EXECUTION');

    const meta = await created({
      ...complete(),
      periodoInicio: '2026-01-05',
      periodoFim: '2026-07-20',
    });
    const edicao = await patch(meta.id, { versao: 1, periodoFim: '2026-08-01' }).expect(400);
    expect((edicao.body as ErrorBody).code).toBe('OUTSIDE_PROJECT_EXECUTION');
    expect(await prisma.meta.count()).toBe(1);
  });

  it('aceita periodo com uma data so, como rascunho', async () => {
    const meta = await created({ ...complete(), periodoInicio: undefined });

    expect(meta).toMatchObject({ periodoInicio: null, rascunho: true });
  });

  it('projeto ou meta inexistente devolve 404', async () => {
    await post(complete(), MISSING).expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO).get(`/v1/projects/${MISSING}/goals`).expect(404);
    await patch(MISSING, { versao: 1, objetivo: 'x' }).expect(404);
  });

  it('instrumento inativo nao recebe nem altera meta', async () => {
    const meta = await created();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const cadastro = await post(draft()).expect(409);
    const edicao = await patch(meta.id, { versao: 1, objetivo: 'Outro' }).expect(409);

    expect((cadastro.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect((edicao.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect(await prisma.meta.count()).toBe(1);
  });

  it('edita com a versao lida, registra so o que mudou, inclusive os requisitos', async () => {
    const meta = await created();

    const res = await patch(meta.id, {
      versao: 1,
      parametroPlanejado: '150',
      requisitoIds: [frequencia],
    }).expect(200);
    expect(res.body).toMatchObject({ versao: 2, parametroPlanejado: '150' });
    expect((res.body as GoalBody).requisitos.map((requisito) => requisito.id)).toEqual([
      frequencia,
    ]);

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: meta.id, acao: 'GOAL_UPDATED' },
    });
    expect(edicao.antes).toEqual({
      parametroPlanejado: '120',
      requisitoIds: [certificado, frequencia].sort(),
    });
    expect(edicao.depois).toEqual({ parametroPlanejado: '150', requisitoIds: [frequencia] });
    expect(await prisma.metaRequisito.count({ where: { metaId: meta.id } })).toBe(1);
  });

  it('recusa versao antiga sem gravar campos nem requisitos', async () => {
    const meta = await created();
    await patch(meta.id, { versao: 1, objetivo: 'Primeira edição' }).expect(200);

    const conflito = await patch(meta.id, {
      versao: 1,
      objetivo: 'Edição atrasada',
      requisitoIds: [frequencia],
    }).expect(409);

    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');
    const row = await prisma.meta.findUniqueOrThrow({ where: { id: meta.id } });
    expect(row).toMatchObject({ versao: 2, objetivo: 'Primeira edição' });
    expect(await prisma.metaRequisito.count({ where: { metaId: meta.id } })).toBe(2);
  });

  it('duas edicoes simultaneas da mesma versao: uma grava, a outra recebe 409', async () => {
    const meta = await created();

    const respostas = await Promise.all([
      patch(meta.id, { versao: 1, requisitoIds: [frequencia] }),
      patch(meta.id, { versao: 1, requisitoIds: [certificado] }),
    ]);

    expect(respostas.map((res) => res.status).sort()).toEqual([200, 409]);
    const vinculos = await prisma.metaRequisito.findMany({ where: { metaId: meta.id } });
    const vencedora = respostas.find((res) => res.status === 200)?.body as GoalBody;
    expect(vinculos.map((vinculo) => vinculo.requisitoId)).toEqual(
      vencedora.requisitos.map((requisito) => requisito.id),
    );
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'GOAL_UPDATED' } })).toBe(1);
  });

  it('na edicao, recusa requisito alheio, lista vazia e campo obrigatorio nulo, sem gravar', async () => {
    const meta = await created();
    const alheio = await requirement(await instrument(), 'Requisito de outro termo', null);

    const fora = await patch(meta.id, { versao: 1, requisitoIds: [alheio] }).expect(400);
    expect((fora.body as ErrorBody).code).toBe('REQUIREMENT_OUTSIDE_INSTRUMENT');
    const vazia = await patch(meta.id, { versao: 1, requisitoIds: [] }).expect(400);
    expect((vazia.body as ErrorBody).code).toBe('GOAL_REQUIREMENT_REQUIRED');
    await patch(meta.id, { versao: 1, objetivo: null }).expect(400);
    await patch(meta.id, { versao: 1, origem: null }).expect(400);

    expect(await prisma.meta.findUniqueOrThrow({ where: { id: meta.id } })).toMatchObject({
      versao: 1,
    });
    expect(await prisma.metaRequisito.count({ where: { metaId: meta.id } })).toBe(2);
  });

  it('edicao sem mudanca, com os requisitos em outra ordem, nao sobe a versao', async () => {
    const meta = await created();

    const res = await patch(meta.id, {
      versao: 1,
      objetivo: meta.objetivo,
      requisitoIds: [frequencia, certificado],
    }).expect(200);

    expect((res.body as GoalBody).versao).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'GOAL_UPDATED' } })).toBe(0);
  });

  it('acesso por perfil conforme a matriz da secao 8.5.1', async () => {
    const meta = await created();
    const list = `/v1/projects/${projetoId}/goals`;
    const detail = `/v1/goals/${meta.id}`;

    for (const perfil of [Perfil.NUCLEO_PEDAGOGICO, Perfil.ADMINISTRATIVO_FINANCEIRO]) {
      await as(perfil).get(list).expect(200);
      await as(perfil).post(list, draft()).expect(403);
      await as(perfil).patch(detail, { versao: 1, objetivo: 'x' }).expect(403);
    }
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(list).expect(403);
      await as(perfil).post(list, draft()).expect(403);
      await as(perfil).patch(detail, { versao: 1, objetivo: 'x' }).expect(403);
    }
    await request(app.getHttpServer()).get(list).expect(401);
    await request(app.getHttpServer()).post(list).send(draft()).expect(401);
    await request(app.getHttpServer()).patch(detail).send({ versao: 1, objetivo: 'x' }).expect(401);
    expect(await prisma.meta.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'GOAL_UPDATED' } })).toBe(0);
  });
});
