import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { OrigemMeta, Perfil, TipoInstrumento } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';
const MISSING = '00000000-0000-4000-8000-000000000000';

const NAMES: Record<Perfil, string> = {
  PRESIDENCIA_GESTAO: 'Beatriz Gestão',
  NUCLEO_PEDAGOGICO: 'Ana Pedagógica',
  ADMINISTRATIVO_FINANCEIRO: 'Carla Financeiro',
  CONCEDENTE_AUDITORIA: 'Davi Auditoria',
  ADMINISTRACAO_SISTEMA: 'Eva Administração',
};

interface ActivityBody {
  id: string;
  versao: number;
  projetoId: string;
  titulo: string;
  data: string;
  local: string;
  modalidade: { id: string; nome: string; ativo: boolean };
  responsavel: { id: string; nome: string; ativo: boolean };
  metas: Array<{ id: string; ordem: number; objetivo: string }>;
}

interface ErrorBody {
  code: string;
  message: string;
  details: { errors?: string[] };
}

describe('Atividades do projeto (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let desativadaId: string;
  let instrumentoId: string;
  let projetoId: string;
  let modalidadeId: string;
  let meta1Id: string;
  let meta2Id: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await passwords.hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      const pessoa = await prisma.pessoa.create({ data: { nome: NAMES[perfil] } });
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
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Fábio Desativado' } });
    desativadaId = (
      await prisma.usuario.create({
        data: {
          pessoaId: pessoa.id,
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
      'TRUNCATE TABLE trilha_auditoria, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    const inst = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.EMENDA,
        orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
        numeroProcesso: '00150-00001234/2026-11',
        valorGlobal: '150000.00',
        dataCelebracao: new Date('2026-03-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-04-01T00:00:00.000Z'),
        vigenciaFim: new Date('2027-03-31T00:00:00.000Z'),
      },
    });
    instrumentoId = inst.id;

    const proj = await prisma.projeto.create({
      data: {
        instrumentoId,
        coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
        codigo: 'P01',
        titulo: 'Cultura Viva no SCS',
        inicio: new Date('2026-05-01T00:00:00.000Z'),
        fim: new Date('2026-12-15T00:00:00.000Z'),
      },
    });
    projetoId = proj.id;

    const mod = await prisma.modalidade.create({
      data: { nome: 'Oficina contínua', descricao: 'Encontros regulares' },
    });
    modalidadeId = mod.id;

    meta1Id = (
      await prisma.meta.create({
        data: {
          projetoId,
          ordem: 1,
          origem: OrigemMeta.EDITAL,
          objetivo: 'Realizar 12 oficinas de música',
          descricao: 'Oficinas semanais no SCS',
        },
      })
    ).id;
    meta2Id = (
      await prisma.meta.create({
        data: {
          projetoId,
          ordem: 2,
          origem: OrigemMeta.PROJETO,
          objetivo: 'Atender 120 jovens',
          descricao: 'Jovens em vulnerabilidade',
        },
      })
    ).id;
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

  function valid(): object {
    return {
      titulo: 'Oficina de música e cidadania — Turma A',
      modalidadeId,
      responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      data: '2026-10-28',
      local: 'Galpão Cultural SCS',
      metaIds: [meta1Id, meta2Id],
    };
  }

  function post(body: object, id = projetoId, perfil: Perfil = Perfil.NUCLEO_PEDAGOGICO) {
    return as(perfil).post(`/v1/projects/${id}/activities`, body);
  }

  async function created(
    body: object = {},
    id = projetoId,
    perfil: Perfil = Perfil.NUCLEO_PEDAGOGICO,
  ): Promise<ActivityBody> {
    const res = await post({ ...valid(), ...body }, id, perfil).expect(201);
    return res.body as ActivityBody;
  }

  it('cadastra atividade ligada a modalidade e metas do projeto, e grava a trilha', async () => {
    const atividade = await created({
      titulo: '  Oficina de música e cidadania  ',
      local: '  Galpão Cultural SCS  ',
      metaIds: [meta2Id, meta1Id],
    });

    expect(atividade).toMatchObject({
      versao: 1,
      projetoId,
      titulo: 'Oficina de música e cidadania',
      data: '2026-10-28',
      local: 'Galpão Cultural SCS',
      modalidade: { id: modalidadeId, nome: 'Oficina contínua', ativo: true },
      responsavel: { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: 'Ana Pedagógica', ativo: true },
      metas: [
        { id: meta1Id, ordem: 1, objetivo: 'Realizar 12 oficinas de música' },
        { id: meta2Id, ordem: 2, objetivo: 'Atender 120 jovens' },
      ],
    });

    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: atividade.id } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'ACTIVITY_CREATED',
      usuarioId: ids[Perfil.NUCLEO_PEDAGOGICO],
      depois: expect.objectContaining({
        projetoId,
        modalidadeId,
        metaIds: [meta1Id, meta2Id],
      }) as unknown,
    });

    const lista = await as(Perfil.NUCLEO_PEDAGOGICO)
      .get(`/v1/projects/${projetoId}/activities`)
      .expect(200);
    expect(lista.body).toEqual([atividade]);
  });

  it.each([
    ['titulo', { titulo: '   ' }],
    ['modalidadeId', { modalidadeId: undefined }],
    ['responsavelId', { responsavelId: 'invalido' }],
    ['data', { data: '28/10/2026' }],
    ['local', { local: '' }],
    ['metaIds', { metaIds: [] }],
    ['metaIds', { metaIds: undefined }],
    ['metaIds', { metaIds: [MISSING, MISSING] }],
  ])('recusa %s invalido ou ausente com 400 indicando o campo', async (campo, change) => {
    const res = await post({ ...valid(), ...change }).expect(400);

    const { details } = res.body as ErrorBody;
    expect(details.errors?.some((message) => message.startsWith(campo))).toBe(true);
    expect(await prisma.atividade.count()).toBe(0);
    expect(await prisma.atividadeMeta.count()).toBe(0);
  });

  it('recusa data inexistente e campo desconhecido com 400', async () => {
    await post({ ...valid(), data: '2026-02-30' }).expect(400);
    await post({ ...valid(), versao: 2 }).expect(400);
    expect(await prisma.atividade.count()).toBe(0);
  });

  it('recusa meta de outro projeto ou inexistente sem deixar registro orfao', async () => {
    const outroProjeto = await prisma.projeto.create({
      data: {
        instrumentoId,
        coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
        codigo: 'P02',
        titulo: 'Outro projeto',
        inicio: new Date('2026-05-01T00:00:00.000Z'),
        fim: new Date('2026-12-15T00:00:00.000Z'),
      },
    });
    const metaOutroProjeto = await prisma.meta.create({
      data: {
        projetoId: outroProjeto.id,
        ordem: 1,
        origem: OrigemMeta.EDITAL,
        objetivo: 'Meta de outro projeto',
        descricao: 'Não pertence ao P01',
      },
    });

    for (const metaIds of [[meta1Id, metaOutroProjeto.id], [MISSING]]) {
      const res = await post({ ...valid(), metaIds }).expect(400);
      expect((res.body as ErrorBody).code).toBe('META_OUTSIDE_PROJECT');
    }
    expect(await prisma.atividade.count()).toBe(0);
    expect(await prisma.atividadeMeta.count()).toBe(0);
  });

  it('recusa modalidade inexistente ou desativada no cadastro', async () => {
    const inativa = await prisma.modalidade.create({
      data: { nome: 'Modalidade inativa', ativo: false },
    });

    for (const modId of [MISSING, inativa.id]) {
      const res = await post({ ...valid(), modalidadeId: modId }).expect(400);
      expect((res.body as ErrorBody).code).toBe('INVALID_MODALITY');
    }
    expect(await prisma.atividade.count()).toBe(0);
  });

  it('recusa responsavel inexistente ou desativado, e aceita qualquer conta ativa', async () => {
    for (const responsavelId of [MISSING, desativadaId]) {
      const res = await post({ ...valid(), responsavelId }).expect(400);
      expect((res.body as ErrorBody).code).toBe('INVALID_RESPONSIBLE');
    }
    const atividade = await created({ responsavelId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO] });
    expect(atividade.responsavel.id).toBe(ids[Perfil.ADMINISTRATIVO_FINANCEIRO]);
  });

  it('lista todas as contas ativas elegiveis como responsavel', async () => {
    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .get('/v1/activities/eligible-responsibles')
      .expect(200);

    expect(res.body).toEqual([
      { id: ids[Perfil.NUCLEO_PEDAGOGICO], nome: 'Ana Pedagógica' },
      { id: ids[Perfil.PRESIDENCIA_GESTAO], nome: 'Beatriz Gestão' },
      { id: ids[Perfil.ADMINISTRATIVO_FINANCEIRO], nome: 'Carla Financeiro' },
      { id: ids[Perfil.CONCEDENTE_AUDITORIA], nome: 'Davi Auditoria' },
      { id: ids[Perfil.ADMINISTRACAO_SISTEMA], nome: 'Eva Administração' },
    ]);
  });

  it.each([
    ['antes do inicio do projeto', '2026-04-30'],
    ['depois do fim do projeto', '2026-12-16'],
  ])('recusa data %s', async (_caso, data) => {
    const res = await post({ ...valid(), data }).expect(400);

    expect((res.body as ErrorBody).code).toBe('OUTSIDE_PROJECT_PERIOD');
    expect((res.body as ErrorBody).message).toContain('01/05/2026 a 15/12/2026');
  });

  it('instrumento inativo nao recebe nem altera atividade', async () => {
    const atividade = await created();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const cadastro = await post({ ...valid(), titulo: 'Nova' }).expect(409);
    const edicao = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(`/v1/activities/${atividade.id}`, { versao: 1, titulo: 'Alterada' })
      .expect(409);

    expect((cadastro.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect((edicao.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    expect(await prisma.atividade.count()).toBe(1);
  });

  it('projeto ou atividade inexistente devolve 404', async () => {
    await post(valid(), MISSING).expect(404);
    await as(Perfil.NUCLEO_PEDAGOGICO).get(`/v1/projects/${MISSING}/activities`).expect(404);
    await as(Perfil.NUCLEO_PEDAGOGICO).get(`/v1/activities/${MISSING}`).expect(404);
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(`/v1/activities/${MISSING}`, { versao: 1, titulo: 'X' })
      .expect(404);
  });

  it('edita campos e metas sincronizando vinculos, registra na trilha e recusa versao antiga', async () => {
    const atividade = await created({ metaIds: [meta1Id] });
    const path = `/v1/activities/${atividade.id}`;

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path, {
        versao: 1,
        local: 'Praça do Povo SCS',
        metaIds: [meta2Id],
      })
      .expect(200);

    expect(res.body).toMatchObject({
      versao: 2,
      local: 'Praça do Povo SCS',
      metas: [{ id: meta2Id, ordem: 2, objetivo: 'Atender 120 jovens' }],
    });

    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: atividade.id, acao: 'ACTIVITY_UPDATED' },
    });
    expect(edicao.antes).toEqual({
      local: 'Galpão Cultural SCS',
      metaIds: [meta1Id],
    });
    expect(edicao.depois).toEqual({
      local: 'Praça do Povo SCS',
      metaIds: [meta2Id],
    });

    const conflito = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 1, titulo: 'Conflito' })
      .expect(409);
    expect((conflito.body as ErrorBody).code).toBe('VERSION_CONFLICT');
  });

  it('edicao preserva modalidade desativada depois e recusa troca para modalidade inativa', async () => {
    const atividade = await created();
    await prisma.modalidade.update({ where: { id: modalidadeId }, data: { ativo: false } });
    const path = `/v1/activities/${atividade.id}`;

    const atual = await as(Perfil.NUCLEO_PEDAGOGICO).get(path).expect(200);
    expect((atual.body as ActivityBody).modalidade).toMatchObject({ ativo: false });

    await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 1, titulo: 'Título ajustado' })
      .expect(200);

    const outraInativa = await prisma.modalidade.create({
      data: { nome: 'Outra inativa', ativo: false },
    });
    const troca = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path, { versao: 2, modalidadeId: outraInativa.id })
      .expect(400);
    expect((troca.body as ErrorBody).code).toBe('INVALID_MODALITY');
  });

  it('edicao sem mudanca nao sobe a versao nem grava trilha', async () => {
    const atividade = await created({ metaIds: [meta1Id, meta2Id] });

    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(`/v1/activities/${atividade.id}`, {
        versao: 1,
        titulo: atividade.titulo,
        metaIds: [meta2Id, meta1Id],
      })
      .expect(200);

    expect((res.body as ActivityBody).versao).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'ACTIVITY_UPDATED' } })).toBe(0);
  });

  it('acesso por perfil conforme a matriz da secao 8.5.1', async () => {
    const atividade = await created({}, projetoId, Perfil.PRESIDENCIA_GESTAO);
    const list = `/v1/projects/${projetoId}/activities`;
    const detail = `/v1/activities/${atividade.id}`;

    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get(list).expect(200);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get(detail).expect(200);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).post(list, valid()).expect(403);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).patch(detail, { versao: 1, local: 'X' }).expect(403);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
      .get('/v1/activities/eligible-responsibles')
      .expect(403);

    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(list).expect(403);
      await as(perfil).get(detail).expect(403);
      await as(perfil).post(list, valid()).expect(403);
      await as(perfil).patch(detail, { versao: 1, local: 'X' }).expect(403);
      await as(perfil).get('/v1/activities/eligible-responsibles').expect(403);
    }
    expect(await prisma.atividade.count()).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'ACTIVITY_UPDATED' } })).toBe(0);
  });
});
