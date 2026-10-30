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
import { PrismaService } from '../src/prisma/prisma.service.js';
import { DATA_NOTICE } from '../src/public-registrations/notice.js';

const PASSWORD = 'senha longa de quem testa';
const CODIGO = 'codigoPublicoV01';

interface Submitted {
  situacao: string;
  posicaoEspera: number | null;
}

interface ListBody {
  vagas: number;
  confirmadas: number;
  emEspera: number;
  inscricoes: {
    nome: string;
    situacao: string;
    posicaoEspera: number | null;
    menor: boolean;
    responsavelNome: string | null;
  }[];
}

const pessoa = (n: number) => ({
  nome: `Pessoa ${n}`,
  telefone: `619999900${String(n).padStart(2, '0')}`,
  dataNascimento: '1990-05-20',
  email: `pessoa${n}@exemplo.com`,
  versaoAviso: DATA_NOTICE.versao,
  autorizaComunicados: false,
  autorizaImagem: false,
});

describe('Vagas, lista de espera e inscritos da atividade (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let atividadeId: string;
  let outraAtividadeId: string;
  let projetoId: string;

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
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      const dono = await prisma.pessoa.create({ data: { nome: perfil } });
      ids[perfil] = (
        await prisma.usuario.create({
          data: { pessoaId: dono.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
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
      'TRUNCATE TABLE trilha_auditoria, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    const instrumento = await prisma.instrumento.create({
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
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId: instrumento.id,
        coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
        codigo: 'P01',
        titulo: 'Cultura Viva no SCS',
        inicio: new Date('2026-05-01T00:00:00.000Z'),
        fim: new Date('2026-12-15T00:00:00.000Z'),
      },
    });
    projetoId = projeto.id;
    const modalidade = await prisma.modalidade.create({ data: { nome: 'Oficina contínua' } });
    const nova = (titulo: string) =>
      prisma.atividade.create({
        data: {
          projetoId,
          modalidadeId: modalidade.id,
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
          titulo,
          data: new Date('2026-11-10T00:00:00.000Z'),
          local: 'Setor Comercial Sul',
        },
      });
    atividadeId = (await nova('Oficina de serigrafia')).id;
    outraAtividadeId = (await nova('Oficina de fotografia')).id;
    await prisma.configuracaoInscricao.create({
      data: {
        atividadeId,
        vagas: 2,
        camposAdicionais: [CampoInscricao.EMAIL],
        campoDuplicidade: CampoDuplicidade.EMAIL,
        codigoPublico: CODIGO,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => request(app.getHttpServer());
  const enviar = (n: number) => server().post(`/v1/public/registrations/${CODIGO}`).send(pessoa(n));
  const as = (perfil: Perfil) => ({
    get: (url: string) => server().get(url).set('Authorization', `Bearer ${tokens[perfil]}`),
    patch: (url: string, body: object) =>
      server().patch(url).set('Authorization', `Bearer ${tokens[perfil]}`).send(body),
  });
  const listPath = () => `/v1/activities/${atividadeId}/registrations`;

  /** Inscrição gravada direto no banco, na ordem das chamadas (economiza o limite por IP). */
  async function inscrever(n: number, situacao: SituacaoInscricao, menor = false) {
    const participante = await prisma.participante.create({
      data: {
        nome: `Pessoa ${n}`,
        telefone: `619999900${String(n).padStart(2, '0')}`,
        dataNascimento: new Date(menor ? '2015-01-10T00:00:00.000Z' : '1990-05-20T00:00:00.000Z'),
        email: `pessoa${n}@exemplo.com`,
      },
    });
    await prisma.inscricao.create({
      data: {
        atividadeId,
        participanteId: participante.id,
        situacao,
        chaveDuplicidade: `pessoa${n}@exemplo.com`,
        versaoAviso: DATA_NOTICE.versao,
        avisoApresentadoEm: new Date(),
        autorizaComunicados: false,
        autorizaImagem: false,
        responsavelNome: menor ? 'Responsável Legal' : null,
        responsavelTelefone: menor ? '61988887777' : null,
      },
    });
  }

  it('confirma enquanto ha vaga e, esgotadas, coloca na espera em ordem de chegada (CA-07c.1, CA-07c.2)', async () => {
    const respostas: Submitted[] = [];
    for (const n of [1, 2, 3, 4]) {
      respostas.push((await enviar(n).expect(201)).body as Submitted);
    }

    expect(respostas.map((r) => [r.situacao, r.posicaoEspera])).toEqual([
      ['CONFIRMADA', null],
      ['CONFIRMADA', null],
      ['LISTA_ESPERA', 1],
      ['LISTA_ESPERA', 2],
    ]);
    const form = await server().get(`/v1/public/registrations/${CODIGO}`).expect(200);
    expect(form.body).toMatchObject({ aberta: true, vagasEsgotadas: true });
    const trilha = await prisma.trilhaAuditoria.findMany({
      where: { acao: 'REGISTRATION_SUBMITTED' },
      orderBy: { criadoEm: 'asc' },
    });
    expect(trilha.map((linha) => (linha.depois as { situacao: string }).situacao)).toEqual([
      'CONFIRMADA',
      'CONFIRMADA',
      'LISTA_ESPERA',
      'LISTA_ESPERA',
    ]);
  });

  it('na disputa pela ultima vaga, so um envio confirma e os demais entram na espera', async () => {
    await prisma.configuracaoInscricao.update({ where: { atividadeId }, data: { vagas: 1 } });

    const respostas = (await Promise.all([1, 2, 3, 4, 5, 6].map((n) => enviar(n)))).map(
      (res) => res.body as Submitted,
    );

    expect(respostas.filter((r) => r.situacao === 'CONFIRMADA')).toHaveLength(1);
    expect(
      respostas
        .map((r) => r.posicaoEspera)
        .filter((p) => p !== null)
        .sort(),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(
      await prisma.inscricao.count({ where: { situacao: SituacaoInscricao.CONFIRMADA } }),
    ).toBe(1);
  });

  it('com mais vagas, promove a espera na ordem de chegada; com menos, ninguem perde a vaga', async () => {
    await inscrever(1, SituacaoInscricao.CONFIRMADA);
    await inscrever(2, SituacaoInscricao.CONFIRMADA);
    await inscrever(3, SituacaoInscricao.LISTA_ESPERA);
    await inscrever(4, SituacaoInscricao.LISTA_ESPERA);
    const config = `/v1/activities/${atividadeId}/registration`;

    await as(Perfil.NUCLEO_PEDAGOGICO).patch(config, { versao: 1, vagas: 3 }).expect(200);

    let lista = (await as(Perfil.NUCLEO_PEDAGOGICO).get(listPath()).expect(200)).body as ListBody;
    expect(lista.inscricoes.map((i) => [i.nome, i.situacao, i.posicaoEspera])).toEqual([
      ['Pessoa 1', 'CONFIRMADA', null],
      ['Pessoa 2', 'CONFIRMADA', null],
      ['Pessoa 3', 'CONFIRMADA', null],
      ['Pessoa 4', 'LISTA_ESPERA', 1],
    ]);
    const promovida = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'REGISTRATION_PROMOTED' },
    });
    expect(promovida).toMatchObject({
      usuarioId: ids[Perfil.NUCLEO_PEDAGOGICO],
      antes: { situacao: 'LISTA_ESPERA' },
      depois: { situacao: 'CONFIRMADA' },
    });

    await as(Perfil.NUCLEO_PEDAGOGICO).patch(config, { versao: 2, vagas: 1 }).expect(200);

    lista = (await as(Perfil.NUCLEO_PEDAGOGICO).get(listPath()).expect(200)).body as ListBody;
    expect(lista).toMatchObject({ vagas: 1, confirmadas: 3, emEspera: 1 });
  });

  it('sem lista de espera, o formulario avisa as vagas esgotadas e recusa o envio', async () => {
    await prisma.configuracaoInscricao.update({
      where: { atividadeId },
      data: { vagas: 1, listaEspera: false },
    });

    await enviar(1).expect(201);
    const recusa = await enviar(2).expect(409);

    expect((recusa.body as { code: string }).code).toBe('REGISTRATION_FULL');
    const form = await server().get(`/v1/public/registrations/${CODIGO}`).expect(200);
    expect(form.body).toMatchObject({ aberta: true, vagasEsgotadas: true, listaEspera: false });
    expect(await prisma.inscricao.count()).toBe(1);
  });

  it('sem promocao automatica, mais vagas nao confirmam a espera; ligar a promocao confirma', async () => {
    await inscrever(1, SituacaoInscricao.CONFIRMADA);
    await inscrever(2, SituacaoInscricao.CONFIRMADA);
    await inscrever(3, SituacaoInscricao.LISTA_ESPERA);
    const config = `/v1/activities/${atividadeId}/registration`;

    const desligada = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(config, { versao: 1, promocaoAutomatica: false, vagas: 3 })
      .expect(200);
    expect(desligada.body).toMatchObject({ listaEspera: true, promocaoAutomatica: false });
    let lista = (await as(Perfil.NUCLEO_PEDAGOGICO).get(listPath()).expect(200)).body as ListBody;
    expect(lista).toMatchObject({ vagas: 3, confirmadas: 2, emEspera: 1 });

    await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(config, { versao: 2, promocaoAutomatica: true })
      .expect(200);
    lista = (await as(Perfil.NUCLEO_PEDAGOGICO).get(listPath()).expect(200)).body as ListBody;
    expect(lista).toMatchObject({ confirmadas: 3, emEspera: 0 });
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'REGISTRATION_UPDATED' },
      orderBy: { criadoEm: 'asc' },
    });
    expect(trilha.depois).toEqual({ vagas: 3, promocaoAutomatica: false });
  });

  it('lista os inscritos ao Nucleo, com busca, menor e responsavel; os demais veem so os totais', async () => {
    await inscrever(1, SituacaoInscricao.CONFIRMADA);
    await inscrever(2, SituacaoInscricao.CONFIRMADA, true);
    await inscrever(3, SituacaoInscricao.LISTA_ESPERA);

    const lista = (await as(Perfil.NUCLEO_PEDAGOGICO).get(listPath()).expect(200)).body as ListBody;
    expect(lista).toMatchObject({ vagas: 2, confirmadas: 2, emEspera: 1 });
    expect(lista.inscricoes[1]).toMatchObject({
      nome: 'Pessoa 2',
      menor: true,
      responsavelNome: 'Responsável Legal',
    });
    const busca = (
      await as(Perfil.NUCLEO_PEDAGOGICO).get(`${listPath()}?busca=pessoa%203`).expect(200)
    ).body as ListBody;
    expect(busca.inscricoes.map((i) => i.nome)).toEqual(['Pessoa 3']);
    expect(busca.emEspera).toBe(1);

    for (const perfil of [
      Perfil.PRESIDENCIA_GESTAO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.CONCEDENTE_AUDITORIA,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await as(perfil).get(listPath()).expect(403);
    }
    const atividades = (
      await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
        .get(`/v1/projects/${projetoId}/activities`)
        .expect(200)
    ).body as { id: string; inscricao: object | null }[];
    expect(atividades.find((a) => a.id === atividadeId)?.inscricao).toEqual({
      aberta: true,
      vagas: 2,
      inscritos: 2,
      emEspera: 1,
    });
  });

  it('responde 404 para atividade sem inscricao aberta ou inexistente', async () => {
    const semInscricao = await as(Perfil.NUCLEO_PEDAGOGICO)
      .get(`/v1/activities/${outraAtividadeId}/registrations`)
      .expect(404);
    expect((semInscricao.body as { code: string }).code).toBe('REGISTRATION_NOT_OPENED');
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .get('/v1/activities/00000000-0000-4000-8000-000000000000/registrations')
      .expect(404);
  });
});
