import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import {
  CampoDuplicidade,
  CampoInscricao,
  Perfil,
  SituacaoInscricao,
  TipoInstrumento,
} from '../src/generated/prisma/enums.js';
import { todayInBrasilia } from '../src/goals/goal-deadline.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const PASSWORD = 'senha longa de quem testa';

interface Plan {
  acao: 'EXCLUIR' | 'ANONIMIZAR';
  excluidos: string[];
  anonimizados: string[];
  preservados: string[];
  inscricoesCanceladas: number;
}

/** Dia relativo a hoje, em AAAA-MM-DD. */
function day(offset: number): string {
  const date = new Date(`${todayInBrasilia()}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

describe('Exclusão ou anonimização a pedido do titular (HU-15b, e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  let realizada: string;
  let futura: string;
  let ana: string;
  let bruno: string;
  let carla: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await app.get(PasswordService).hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const pessoa = await prisma.pessoa.create({ data: { nome: perfil } });
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      tokens[perfil] = (res.body as { accessToken: string }).accessToken;
    }
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    const coordenador = await prisma.usuario.findUniqueOrThrow({
      where: { emailLogin: 'nucleo_pedagogico@instituto.test' },
    });
    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Secretaria de Cultura',
        numeroProcesso: 'P-1',
        valorGlobal: '100000.00',
        dataCelebracao: new Date('2026-01-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-01-01T00:00:00.000Z'),
        vigenciaFim: new Date('2027-12-31T00:00:00.000Z'),
      },
    });
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId: instrumento.id,
        coordenadorId: coordenador.id,
        codigo: 'P01',
        titulo: 'Cultura Viva',
        inicio: new Date('2026-01-01T00:00:00.000Z'),
        fim: new Date('2027-12-31T00:00:00.000Z'),
      },
    });
    const modalidade = await prisma.modalidade.create({ data: { nome: 'Oficina' } });
    const atividade = async (titulo: string, data: string, vagas: number) => {
      const nova = await prisma.atividade.create({
        data: {
          projetoId: projeto.id,
          modalidadeId: modalidade.id,
          responsavelId: coordenador.id,
          titulo,
          data: new Date(`${data}T00:00:00.000Z`),
          local: 'Sede',
        },
      });
      await prisma.configuracaoInscricao.create({
        data: {
          atividadeId: nova.id,
          vagas,
          camposAdicionais: [CampoInscricao.EMAIL],
          campoDuplicidade: CampoDuplicidade.EMAIL,
          codigoPublico: `codigo${titulo.length}${data.replaceAll('-', '')}`.slice(0, 16),
        },
      });
      return nova.id;
    };
    realizada = await atividade('Serigrafia', day(-10), 30);
    futura = await atividade('Dança', day(10), 1);

    const pessoa = (nome: string, email: string) =>
      prisma.participante.create({
        data: {
          nome,
          telefone: '61999998888',
          dataNascimento: new Date('1990-05-20T00:00:00.000Z'),
          email,
          cpf: '52998224725',
          bairroRegiao: 'Asa Sul',
        },
      });
    const inscreve = (
      participanteId: string,
      atividadeId: string,
      email: string,
      situacao: SituacaoInscricao = SituacaoInscricao.CONFIRMADA,
    ) =>
      prisma.inscricao.create({
        data: {
          atividadeId,
          participanteId,
          situacao,
          chaveDuplicidade: email,
          versaoAviso: 'v1',
          avisoApresentadoEm: new Date(),
          autorizaComunicados: true,
          autorizaImagem: true,
          responsavelNome: 'Responsável',
          responsavelTelefone: '61911112222',
          criadoEm: new Date(`${day(-20)}T12:00:00.000Z`),
        },
      });
    ana = (await pessoa('Ana Souza', 'ana@exemplo.test')).id;
    bruno = (await pessoa('Bruno Lima', 'bruno@exemplo.test')).id;
    carla = (await pessoa('Carla Dias', 'carla@exemplo.test')).id;
    // Ana: atividade realizada e vaga confirmada na futura; Bruno: só a futura; Carla espera.
    await inscreve(ana, realizada, 'ana@exemplo.test');
    await inscreve(ana, futura, 'ana@exemplo.test');
    await inscreve(bruno, realizada, 'bruno@exemplo.test', SituacaoInscricao.CANCELADA);
    await inscreve(carla, futura, 'carla@exemplo.test', SituacaoInscricao.LISTA_ESPERA);
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
  const nucleo = () => as(Perfil.NUCLEO_PEDAGOGICO);
  const PEDIDO = { versao: 1, motivo: 'PEDIDO_TITULAR', canal: 'EMAIL', pedidoEm: day(0) };

  it('com atividade realizada, anonimiza, preserva as inscricoes e cancela a futura', async () => {
    const plano = (await nucleo().get(`/v1/participants/${ana}/erasure`).expect(200)).body as Plan;
    expect(plano).toMatchObject({ acao: 'ANONIMIZAR', inscricoesCanceladas: 1 });
    expect(plano.preservados.join(' ')).toContain('Lei 13.019/2014, art. 68');

    const feito = (await nucleo().post(`/v1/participants/${ana}/erasure`, PEDIDO).expect(200))
      .body as Plan;

    expect(feito).toEqual(plano);
    const row = await prisma.participante.findUniqueOrThrow({
      where: { id: ana },
      include: { inscricoes: true },
    });
    expect(row).toMatchObject({
      nome: 'Participante anonimizado',
      telefone: '',
      email: null,
      cpf: null,
      bairroRegiao: null,
      dataNascimento: new Date('1990-01-01T00:00:00.000Z'),
      versao: 2,
    });
    expect(row.anonimizadoEm).not.toBeNull();
    expect(row.inscricoes).toHaveLength(2);
    for (const inscricao of row.inscricoes) {
      expect(inscricao).toMatchObject({
        responsavelNome: null,
        responsavelTelefone: null,
        chaveDuplicidade: null,
        comunicadosRevogacaoCanal: 'EMAIL',
        imagemRevogacaoCanal: 'EMAIL',
      });
    }
    // A vaga da atividade futura passou para quem esperava; a realizada segue nos totais.
    const situacoes = await prisma.inscricao.findMany({
      where: { atividadeId: futura },
      select: { participanteId: true, situacao: true },
    });
    expect(situacoes).toEqual(
      expect.arrayContaining([
        { participanteId: ana, situacao: 'CANCELADA' },
        { participanteId: carla, situacao: 'CONFIRMADA' },
      ]),
    );
    expect(
      await prisma.inscricao.count({ where: { atividadeId: realizada, situacao: 'CONFIRMADA' } }),
    ).toBe(1);
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'PARTICIPANT_ANONYMIZED', entidadeId: ana },
    });
    expect(trilha.depois).toMatchObject({
      motivo: 'PEDIDO_TITULAR',
      canal: 'EMAIL',
      pedidoEm: day(0),
    });
    expect(JSON.stringify(trilha.depois)).not.toContain('Ana Souza');
  });

  it('a pessoa anonimizada sai da busca e nao recebe correcao nem novo pedido', async () => {
    await nucleo().post(`/v1/participants/${ana}/erasure`, PEDIDO).expect(200);

    const lista = (await nucleo().get('/v1/participants').expect(200)).body as { id: string }[];
    expect(lista.map((p) => p.id)).not.toContain(ana);
    const ficha = (await nucleo().get(`/v1/participants/${ana}`).expect(200)).body as {
      nome: string;
      anonimizadoEm: string | null;
    };
    expect(ficha.nome).toBe('Participante anonimizado');
    expect(ficha.anonimizadoEm).not.toBeNull();
    const repetido = await nucleo().post(`/v1/participants/${ana}/erasure`, {
      ...PEDIDO,
      versao: 2,
    });
    expect(repetido.status).toBe(409);
    expect((repetido.body as { code: string }).code).toBe('ALREADY_ANONYMIZED');
  });

  it('sem atividade realizada, exclui o cadastro e as inscricoes', async () => {
    const plano = (await nucleo().get(`/v1/participants/${carla}/erasure`).expect(200))
      .body as Plan;
    expect(plano.acao).toBe('EXCLUIR');

    await nucleo().post(`/v1/participants/${carla}/erasure`, PEDIDO).expect(200);

    expect(await prisma.participante.count({ where: { id: carla } })).toBe(0);
    expect(await prisma.inscricao.count({ where: { participanteId: carla } })).toBe(0);
    expect(
      await prisma.trilhaAuditoria.count({
        where: { acao: 'PARTICIPANT_DELETED', entidadeId: carla },
      }),
    ).toBe(1);
  });

  it('inscricao cancelada em atividade realizada nao impede a exclusao', async () => {
    const plano = (await nucleo().get(`/v1/participants/${bruno}/erasure`).expect(200))
      .body as Plan;

    expect(plano.acao).toBe('EXCLUIR');
  });

  it('recusa versao antiga, data futura, motivo fora da lista e outros perfis', async () => {
    const antiga = await nucleo().post(`/v1/participants/${ana}/erasure`, { ...PEDIDO, versao: 9 });
    expect((antiga.body as { code: string }).code).toBe('VERSION_CONFLICT');
    const futuraData = await nucleo().post(`/v1/participants/${ana}/erasure`, {
      ...PEDIDO,
      pedidoEm: day(3),
    });
    expect(futuraData.status).toBe(400);
    await nucleo()
      .post(`/v1/participants/${ana}/erasure`, { ...PEDIDO, motivo: 'OUTRO' })
      .expect(400);
    for (const perfil of [Perfil.PRESIDENCIA_GESTAO, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(`/v1/participants/${ana}/erasure`).expect(403);
      await as(perfil).post(`/v1/participants/${ana}/erasure`, PEDIDO).expect(403);
    }
    await nucleo().get('/v1/participants/00000000-0000-4000-8000-000000000000/erasure').expect(404);
    expect(await prisma.participante.count({ where: { anonimizadoEm: { not: null } } })).toBe(0);
  });
});
