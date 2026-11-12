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
const DAY = 24 * 60 * 60 * 1000;

interface Timeline {
  hoje: string;
  instrumento: { numeroProcesso: string; vigenciaFim: string; ativo: boolean };
  projeto: { codigo: string; inicio: string };
  pendencias: { metas: number; vencendo: number; vencidas: number; semResponsavel: number };
  metas: {
    objetivo: string;
    periodoFim: string | null;
    alerta: string | null;
    responsavel: { nome: string } | null;
    setor: { nome: string } | null;
    rascunho: boolean;
    foraDaVigencia: boolean;
  }[];
  requisitos: {
    descricao: string;
    situacao: string;
    metas: {
      objetivo: string;
      projetoCodigo: string;
      rascunho: boolean;
      alcance: string | null;
    }[];
  }[];
}

function brasilia(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(Date.now() + offsetDays * DAY),
  );
}

const day = (offsetDays: number) => new Date(`${brasilia(offsetDays)}T00:00:00.000Z`);

describe('Linha do tempo do projeto (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let p1: string;
  let semMetas: string;

  const get = (id: string, perfil: Perfil) =>
    request(app.getHttpServer())
      .get(`/v1/projects/${id}/timeline`)
      .set('Authorization', `Bearer ${tokens[perfil]}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await passwords.hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const pessoa = await prisma.pessoa.create({ data: { nome: `Pessoa ${perfil}` } });
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
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

    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Secretaria de Cultura',
        numeroProcesso: 'P-LINHA',
        valorGlobal: '100000.00',
        dataCelebracao: day(-200),
        vigenciaInicio: day(-180),
        vigenciaFim: day(200),
      },
    });
    const projeto = async (codigo: string) =>
      prisma.projeto.create({
        data: {
          instrumentoId: instrumento.id,
          coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
          codigo,
          titulo: `Projeto ${codigo}`,
          inicio: day(-170),
          fim: day(190),
        },
      });
    const primeiro = await projeto('P01');
    const segundo = await projeto('P02');
    p1 = primeiro.id;
    semMetas = (await projeto('P03')).id;

    const meta = async (
      projetoId: string,
      ordem: number,
      objetivo: string,
      fim: number | null,
      extra: {
        responsavelId?: string | null;
        situacao?: 'CONCLUIDA';
        setorId?: string;
        periodoInicio?: Date;
      } = {},
    ) =>
      prisma.meta.create({
        data: {
          projetoId,
          ordem,
          origem: 'EDITAL',
          objetivo,
          descricao: objetivo,
          indicador: 'Indicador',
          formaComprovacao: 'Lista de presença',
          periodoInicio: day(-170),
          periodoFim: fim === null ? null : day(fim),
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
          ...extra,
        },
      });
    const setor = await prisma.setor.create({ data: { nome: 'Pedagógico' } });
    const vencida = await meta(p1, 1, 'Vencida', -3, { setorId: setor.id });
    await meta(p1, 2, 'Vencendo sem responsavel', 10, { responsavelId: null });
    await meta(p1, 3, 'Fora da vigencia', 195);
    const concluida = await meta(p1, 4, 'Concluida vencida', -5, {
      situacao: 'CONCLUIDA',
      responsavelId: null,
    });
    await meta(p1, 5, 'Sem prazo', null);
    await meta(p1, 6, 'Antes do inicio', -175, {
      situacao: 'CONCLUIDA',
      periodoInicio: day(-180),
    });
    const outroProjeto = await meta(segundo.id, 1, 'Do outro projeto', 40, {
      situacao: 'CONCLUIDA',
    });

    const requisito = async (descricao: string, metaIds: string[]) => {
      const row = await prisma.requisitoInstrumento.create({
        data: { instrumentoId: instrumento.id, descricao },
      });
      for (const metaId of metaIds) {
        await prisma.metaRequisito.create({ data: { metaId, requisitoId: row.id } });
      }
    };
    await requisito('Atendido entre projetos', [concluida.id, outroProjeto.id]);
    await requisito('Pendente', [concluida.id, vencida.id]);
    await requisito('Sem meta', []);

    const parcial = await meta(segundo.id, 2, 'Parcial', 40, { situacao: 'CONCLUIDA' });
    await prisma.resultadoMeta.create({
      data: {
        metaId: parcial.id,
        dataReferencia: day(-1),
        descricao: 'Metade das turmas',
        alcance: 'PARCIALMENTE_CUMPRIDA',
        registradoPorId: ids[Perfil.PRESIDENCIA_GESTAO],
      },
    });
    await requisito('Parcialmente cumprido', [parcial.id]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('mostra a vigência, os prazos em ordem e os responsáveis', async () => {
    const res = await get(p1, Perfil.PRESIDENCIA_GESTAO).expect(200);
    const body = res.body as Timeline;
    expect(body.hoje).toBe(brasilia(0));
    expect(body.instrumento).toMatchObject({
      numeroProcesso: 'P-LINHA',
      vigenciaFim: brasilia(200),
      ativo: true,
    });
    expect(body.projeto).toMatchObject({ codigo: 'P01', inicio: brasilia(-170) });
    expect(body.metas.map((goal) => goal.objetivo)).toEqual([
      'Antes do inicio',
      'Concluida vencida',
      'Vencida',
      'Vencendo sem responsavel',
      'Fora da vigencia',
      'Sem prazo',
    ]);
    expect(body.metas[2]).toMatchObject({
      alerta: 'VENCIDA',
      responsavel: { nome: `Pessoa ${Perfil.NUCLEO_PEDAGOGICO}` },
      setor: { nome: 'Pedagógico' },
      rascunho: false,
    });
  });

  it('marca a meta em rascunho e a meta com prazo fora do período do projeto', async () => {
    const res = await get(p1, Perfil.PRESIDENCIA_GESTAO).expect(200);
    const body = res.body as Timeline;
    const flags = Object.fromEntries(
      body.metas.map((goal) => [goal.objetivo, [goal.rascunho, goal.foraDaVigencia]]),
    );
    expect(flags['Fora da vigencia']).toEqual([false, true]);
    expect(flags['Antes do inicio']).toEqual([false, true]);
    expect(flags['Sem prazo']).toEqual([true, false]);
    expect(flags.Vencida).toEqual([false, false]);
  });

  it('conta as pendências só das metas abertas', async () => {
    const res = await get(p1, Perfil.NUCLEO_PEDAGOGICO).expect(200);
    const body = res.body as Timeline;
    expect(body.pendencias).toEqual({ metas: 6, vencendo: 1, vencidas: 1, semResponsavel: 1 });
    expect(body.metas[1]).toMatchObject({ alerta: null, responsavel: null });
  });

  it('avalia o requisito pelas metas de todos os projetos do instrumento', async () => {
    const res = await get(p1, Perfil.ADMINISTRATIVO_FINANCEIRO).expect(200);
    const body = res.body as Timeline;
    expect(body.requisitos.map(({ descricao, situacao }) => [descricao, situacao])).toEqual([
      ['Atendido entre projetos', 'ATENDIDO'],
      ['Pendente', 'PENDENTE'],
      ['Sem meta', 'SEM_META'],
      ['Parcialmente cumprido', 'PENDENTE'],
    ]);
    expect(body.requisitos[3].metas[0]).toMatchObject({
      alcance: 'PARCIALMENTE_CUMPRIDA',
      rascunho: false,
    });
    expect(body.requisitos[0].metas.map((goal) => goal.projetoCodigo).sort()).toEqual([
      'P01',
      'P02',
    ]);
  });

  it('projeto sem meta volta sem pendências e com os requisitos do instrumento', async () => {
    const res = await get(semMetas, Perfil.PRESIDENCIA_GESTAO).expect(200);
    const body = res.body as Timeline;
    expect(body.metas).toEqual([]);
    expect(body.pendencias).toEqual({ metas: 0, vencendo: 0, vencidas: 0, semResponsavel: 0 });
    expect(body.requisitos).toHaveLength(4);
  });

  it.each([Perfil.ADMINISTRACAO_SISTEMA, Perfil.CONCEDENTE_AUDITORIA])(
    'recusa %s',
    async (perfil) => {
      await get(p1, perfil).expect(403);
    },
  );

  it('exige autenticação', async () => {
    await request(app.getHttpServer()).get(`/v1/projects/${p1}/timeline`).expect(401);
  });

  it('responde 404 para projeto inexistente e 400 para id inválido', async () => {
    await get('00000000-0000-4000-8000-000000000000', Perfil.PRESIDENCIA_GESTAO).expect(404);
    await get('nao-e-uuid', Perfil.PRESIDENCIA_GESTAO).expect(400);
  });
});
