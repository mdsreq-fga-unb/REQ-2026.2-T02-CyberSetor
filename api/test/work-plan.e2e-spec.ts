import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  Perfil,
  TipoInstrumento,
} from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';

interface WorkPlan {
  versoes: {
    numero: number;
    tipo: string;
    documentoOrigem: string;
    vigenciaFimAnterior: string | null;
    vigenciaFimNova: string | null;
    registradoPor: { nome: string };
    metas: { metaId: string; parametroAntes: string | null; parametroDepois: string | null }[];
  }[];
  repactuadas: {
    metaId: string;
    previstoOriginal: string | null;
    reprogramado: string | null;
    realizado: number | null;
  }[];
  foraDaVigencia: string[];
}

describe('Versões do plano de trabalho (HU-14, e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;
  let projetoId: string;
  let metaId: string;
  let outraMetaId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, plano_versao_meta, plano_versao, relatorio_pdf, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await app.get(PasswordService).hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const pessoa = await prisma.pessoa.create({ data: { nome: `Pessoa ${perfil}` } });
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      ids[perfil] = (
        await prisma.usuario.create({
          data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
        })
      ).id;
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      tokens[perfil] = (res.body as { accessToken: string }).accessToken;
    }
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, plano_versao_meta, plano_versao, relatorio_pdf, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Secretaria de Cultura',
        numeroProcesso: 'P-1',
        valorGlobal: '100000.00',
        dataCelebracao: new Date('2026-01-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-01-01T00:00:00.000Z'),
        vigenciaFim: new Date('2026-12-31T00:00:00.000Z'),
      },
    });
    instrumentoId = instrumento.id;
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId,
        coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
        codigo: 'P01',
        titulo: 'Cultura Viva',
        inicio: new Date('2026-01-01T00:00:00.000Z'),
        fim: new Date('2026-12-31T00:00:00.000Z'),
      },
    });
    projetoId = projeto.id;
    const meta = (ordem: number, periodoFim: string) =>
      prisma.meta.create({
        data: {
          projetoId,
          ordem,
          origem: OrigemMeta.PROJETO,
          objetivo: `Objetivo ${ordem}`,
          descricao: `Descrição ${ordem}`,
          modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
          parametroPlanejado: '100',
          unidade: 'participantes',
          periodoInicio: new Date('2026-02-01T00:00:00.000Z'),
          periodoFim: new Date(`${periodoFim}T00:00:00.000Z`),
        },
      });
    metaId = (await meta(1, '2026-06-30')).id;
    outraMetaId = (await meta(2, '2026-11-30')).id;
    await prisma.resultadoMeta.create({
      data: {
        metaId,
        dataReferencia: new Date('2026-05-01T00:00:00.000Z'),
        descricao: '80 participantes',
        valorAlcancado: '80',
        parametroPlanejado: '100',
        percentual: '80',
        alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
        registradoPorId: ids[Perfil.NUCLEO_PEDAGOGICO],
      },
    });
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
    };
  }
  const gestao = () => as(Perfil.PRESIDENCIA_GESTAO);
  const path = () => `/v1/projects/${projetoId}/plan-versions`;
  const ADITIVO = {
    tipo: 'TERMO_ADITIVO',
    dataDocumento: '2026-07-01',
    documentoOrigem: 'Termo Aditivo 1/2026',
  };

  it('projeto sem registro mostra so a versao original, sem comparativo (CA-14.6)', async () => {
    const plano = (await gestao().get(path()).expect(200)).body as WorkPlan;

    expect(plano).toEqual({ versoes: [], repactuadas: [], foraDaVigencia: [] });
  });

  it('o termo aditivo cria a versao 2, preserva o original e os resultados (CA-14.1 a CA-14.3)', async () => {
    await gestao()
      .post(path(), {
        ...ADITIVO,
        metas: [{ metaId, versao: 1, parametroPlanejado: '120', periodoFim: '2026-09-30' }],
      })
      .expect(201);

    const plano = (await gestao().get(path()).expect(200)).body as WorkPlan;
    expect(plano.versoes).toHaveLength(1);
    expect(plano.versoes[0]).toMatchObject({
      numero: 2,
      tipo: 'TERMO_ADITIVO',
      documentoOrigem: 'Termo Aditivo 1/2026',
      registradoPor: { nome: `Pessoa ${Perfil.PRESIDENCIA_GESTAO}` },
    });
    expect(plano.versoes[0]?.metas[0]).toMatchObject({
      parametroAntes: '100',
      parametroDepois: '120',
    });
    expect(plano.repactuadas).toEqual([
      expect.objectContaining({
        metaId,
        previstoOriginal: '100',
        reprogramado: '120',
        realizado: 80,
      }),
    ]);
    const resultado = await prisma.resultadoMeta.findFirstOrThrow({ where: { metaId } });
    expect(resultado.parametroPlanejado?.toNumber()).toBe(100);
    expect(resultado.percentual?.toNumber()).toBe(80);
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'PLAN_VERSION_CREATED', entidadeId: projetoId },
    });
    expect(trilha).toMatchObject({
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      depois: { numero: 2, documentoOrigem: 'Termo Aditivo 1/2026' },
    });
  });

  it('a segunda repactuacao segue a numeracao e mantem o previsto original', async () => {
    await gestao()
      .post(path(), { ...ADITIVO, metas: [{ metaId, versao: 1, parametroPlanejado: '120' }] })
      .expect(201);
    await gestao()
      .post(path(), {
        ...ADITIVO,
        tipo: 'APOSTILA',
        documentoOrigem: 'Apostila 2/2026',
        metas: [{ metaId, versao: 2, parametroPlanejado: '150' }],
      })
      .expect(201);

    const plano = (await gestao().get(path()).expect(200)).body as WorkPlan;
    expect(plano.versoes.map((v) => v.numero)).toEqual([3, 2]);
    expect(plano.repactuadas[0]).toMatchObject({ previstoOriginal: '100', reprogramado: '150' });
  });

  it('o oficio muda a vigencia, guarda a anterior e sinaliza as metas fora dela (CA-14.4, CA-14.5)', async () => {
    await gestao()
      .post(path(), {
        tipo: 'OFICIO',
        dataDocumento: '2026-07-01',
        documentoOrigem: 'Ofício 10/2026',
        publicacao: 'DODF 120, de 01/07/2026',
        justificativa: 'Prazo reduzido pelo concedente.',
        vigenciaFim: '2026-10-31',
        metas: [],
      })
      .expect(201);

    const plano = (await gestao().get(path()).expect(200)).body as WorkPlan;
    expect(plano.versoes[0]).toMatchObject({
      vigenciaFimAnterior: '2026-12-31',
      vigenciaFimNova: '2026-10-31',
    });
    expect(plano.foraDaVigencia).toEqual([outraMetaId]);
    const instrumento = await prisma.instrumento.findUniqueOrThrow({
      where: { id: instrumentoId },
    });
    expect(instrumento.vigenciaFim).toEqual(new Date('2026-10-31T00:00:00.000Z'));
    const meta = await prisma.meta.findUniqueOrThrow({ where: { id: outraMetaId } });
    expect(meta.periodoFim).toEqual(new Date('2026-11-30T00:00:00.000Z'));
  });

  it('recusa registro incompleto, com o motivo (CA-14.6)', async () => {
    const semDocumento = await gestao().post(path(), {
      ...ADITIVO,
      documentoOrigem: '  ',
      metas: [{ metaId, versao: 1, parametroPlanejado: '120' }],
    });
    expect(semDocumento.status).toBe(400);
    const oficio = await gestao().post(path(), {
      ...ADITIVO,
      tipo: 'OFICIO',
      vigenciaFim: '2026-10-31',
      metas: [],
    });
    expect((oficio.body as { code: string }).code).toBe('OFFICE_REQUIRES_PUBLICATION');
    const semMeta = await gestao().post(path(), { ...ADITIVO, metas: [] });
    expect((semMeta.body as { code: string }).code).toBe('NO_GOAL_CHANGED');
    const vigencia = await gestao().post(path(), {
      ...ADITIVO,
      vigenciaFim: '2026-10-31',
      metas: [{ metaId, versao: 1, parametroPlanejado: '120' }],
    });
    expect((vigencia.body as { code: string }).code).toBe('PERIOD_REQUIRES_OFFICE');
    expect(await prisma.planoVersao.count()).toBe(0);
  });

  it('recusa parametro invalido, periodo fora da execucao e versao antiga, sem gravar nada', async () => {
    const parametro = await gestao().post(path(), {
      ...ADITIVO,
      metas: [{ metaId, versao: 1, parametroPlanejado: 'muitos' }],
    });
    expect((parametro.body as { code: string }).code).toBe('INVALID_PLANNED_VALUE');
    const periodo = await gestao().post(path(), {
      ...ADITIVO,
      metas: [{ metaId, versao: 1, periodoFim: '2027-03-01' }],
    });
    expect((periodo.body as { code: string }).code).toBe('OUTSIDE_PROJECT_EXECUTION');
    const antiga = await gestao().post(path(), {
      ...ADITIVO,
      metas: [{ metaId, versao: 9, parametroPlanejado: '120' }],
    });
    expect((antiga.body as { code: string }).code).toBe('VERSION_CONFLICT');
    expect(await prisma.planoVersao.count()).toBe(0);
    const meta = await prisma.meta.findUniqueOrThrow({ where: { id: metaId } });
    expect(meta.parametroPlanejado).toBe('100');
  });

  it('so a Presidencia registra; quem le relatorios le o plano; instrumento inativo recusa', async () => {
    const corpo = { ...ADITIVO, metas: [{ metaId, versao: 1, parametroPlanejado: '120' }] };
    await as(Perfil.NUCLEO_PEDAGOGICO).post(path(), corpo).expect(403);
    await as(Perfil.NUCLEO_PEDAGOGICO).get(path()).expect(200);
    await as(Perfil.ADMINISTRACAO_SISTEMA).get(path()).expect(403);

    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });
    const inativo = await gestao().post(path(), corpo).expect(409);
    expect((inativo.body as { code: string }).code).toBe('INSTRUMENT_INACTIVE');
  });
});
