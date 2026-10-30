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
const VALID = { vagas: 30, camposAdicionais: ['EMAIL', 'CPF'], campoDuplicidade: 'CPF' };

interface RegistrationBody {
  atividadeId: string;
  versao: number;
  aberta: boolean;
  vagas: number;
  camposMinimos: string[];
  camposAdicionais: string[];
  campoDuplicidade: string;
  codigoPublico: string;
  linkPublico: string;
  termoCompromisso: string | null;
  apresentacao: string | null;
  prazoInscricao: string | null;
  contatoWhatsapp: string | null;
}

/** Dia no formato AAAA-MM-DD, contado a partir de hoje (UTC basta: o teste fica longe da virada). */
function day(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

describe('Configuração da inscrição da atividade (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;
  let projetoId: string;
  let atividadeId: string;
  let outraAtividadeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
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
      'TRUNCATE TABLE trilha_auditoria, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    instrumentoId = (
      await prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.EMENDA,
          orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
          numeroProcesso: '00150-00001234/2026-11',
          valorGlobal: '150000.00',
          dataCelebracao: new Date('2026-03-10T00:00:00.000Z'),
          vigenciaInicio: new Date('2026-04-01T00:00:00.000Z'),
          vigenciaFim: new Date('2027-03-31T00:00:00.000Z'),
        },
      })
    ).id;
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId,
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
          projetoId: projeto.id,
          modalidadeId: modalidade.id,
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
          titulo,
          data: new Date('2026-06-10T00:00:00.000Z'),
          local: 'Setor Comercial Sul',
        },
      });
    atividadeId = (await nova('Oficina de serigrafia')).id;
    outraAtividadeId = (await nova('Oficina de fotografia')).id;
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

  const path = (id = atividadeId) => `/v1/activities/${id}/registration`;

  async function opened(body: object = VALID, id = atividadeId): Promise<RegistrationBody> {
    const res = await as(Perfil.NUCLEO_PEDAGOGICO).post(path(id), body).expect(201);
    return res.body as RegistrationBody;
  }

  it('abre a inscricao com vagas, campos e chave de duplicidade, e grava a trilha', async () => {
    const inscricao = await opened();

    expect(inscricao).toMatchObject({
      atividadeId,
      versao: 1,
      aberta: true,
      vagas: 30,
      camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
      camposAdicionais: ['CPF', 'EMAIL'],
      campoDuplicidade: 'CPF',
    });
    expect(inscricao.linkPublico).toBe(`/inscrever/${inscricao.codigoPublico}`);
    const trilha = await prisma.trilhaAuditoria.findMany({ where: { entidadeId: atividadeId } });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      acao: 'REGISTRATION_OPENED',
      usuarioId: ids[Perfil.NUCLEO_PEDAGOGICO],
      depois: expect.objectContaining({ vagas: 30, campoDuplicidade: 'CPF' }) as unknown,
    });
  });

  it('cada atividade recebe um codigo publico proprio, que nao e o id da atividade', async () => {
    const primeira = await opened();
    const segunda = await opened(VALID, outraAtividadeId);

    expect(primeira.codigoPublico).not.toBe(segunda.codigoPublico);
    expect(primeira.codigoPublico).not.toContain(atividadeId);
    expect(primeira.codigoPublico).toMatch(/^[A-Za-z0-9_-]{16}$/);
  });

  it.each([
    ['campo sensivel fora da lista', { ...VALID, camposAdicionais: ['EMAIL', 'RACA_COR'] }],
    ['campo de saude fora da lista', { ...VALID, camposAdicionais: ['CPF', 'DEFICIENCIA'] }],
    ['campo repetido', { ...VALID, camposAdicionais: ['CPF', 'CPF'] }],
    ['vagas zero', { ...VALID, vagas: 0 }],
    ['vagas fracionadas', { ...VALID, vagas: 2.5 }],
    ['chave de duplicidade invalida', { ...VALID, campoDuplicidade: 'NOME' }],
    ['campo desconhecido', { ...VALID, aberta: false }],
  ])('recusa %s com 400', async (_caso, body) => {
    await as(Perfil.NUCLEO_PEDAGOGICO).post(path(), body).expect(400);
    expect(await prisma.configuracaoInscricao.count()).toBe(0);
  });

  it('recusa chave de duplicidade que o formulario nao pede', async () => {
    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(path(), { vagas: 20, camposAdicionais: ['EMAIL'], campoDuplicidade: 'CPF' })
      .expect(400);
    expect((res.body as { code: string }).code).toBe('DUPLICATE_KEY_NOT_ASKED');
  });

  it('nao abre duas vezes a inscricao da mesma atividade', async () => {
    await opened();
    const res = await as(Perfil.NUCLEO_PEDAGOGICO).post(path(), VALID).expect(409);
    expect((res.body as { code: string }).code).toBe('REGISTRATION_ALREADY_OPENED');
  });

  it('encerra e reabre a inscricao, com acao propria na trilha', async () => {
    await opened();

    const encerrada = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, aberta: false })
      .expect(200);
    expect(encerrada.body as RegistrationBody).toMatchObject({ versao: 2, aberta: false });

    await as(Perfil.NUCLEO_PEDAGOGICO).patch(path(), { versao: 2, aberta: true }).expect(200);
    const acoes = await prisma.trilhaAuditoria.findMany({
      where: { entidadeId: atividadeId },
      orderBy: { criadoEm: 'asc' },
      select: { acao: true },
    });
    expect(acoes.map((item) => item.acao)).toEqual([
      'REGISTRATION_OPENED',
      'REGISTRATION_CLOSED',
      'REGISTRATION_REOPENED',
    ]);
  });

  it('edita vagas e campos com a versao lida, registra so o que mudou e recusa versao antiga', async () => {
    await opened();

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(path(), { versao: 1, vagas: 40, camposAdicionais: ['EMAIL', 'CPF', 'BAIRRO_REGIAO'] })
      .expect(200);
    expect(res.body as RegistrationBody).toMatchObject({
      versao: 2,
      vagas: 40,
      camposAdicionais: ['BAIRRO_REGIAO', 'CPF', 'EMAIL'],
    });
    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: atividadeId, acao: 'REGISTRATION_UPDATED' },
    });
    expect(edicao.antes).toEqual({ vagas: 30, camposAdicionais: ['CPF', 'EMAIL'] });
    expect(edicao.depois).toEqual({
      vagas: 40,
      camposAdicionais: ['BAIRRO_REGIAO', 'CPF', 'EMAIL'],
    });

    const conflito = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, vagas: 50 })
      .expect(409);
    expect((conflito.body as { code: string }).code).toBe('VERSION_CONFLICT');
  });

  it('abre com termo de compromisso, troca e tira o termo, com a trilha do que mudou', async () => {
    const inscricao = await opened({ ...VALID, termoCompromisso: '  Chegar no horário.  ' });
    expect(inscricao.termoCompromisso).toBe('Chegar no horário.');

    const trocado = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, termoCompromisso: 'Chegar no horário e avisar faltas.' })
      .expect(200);
    expect(trocado.body as RegistrationBody).toMatchObject({
      versao: 2,
      termoCompromisso: 'Chegar no horário e avisar faltas.',
    });
    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: atividadeId, acao: 'REGISTRATION_UPDATED' },
    });
    expect(edicao.antes).toEqual({ termoCompromisso: 'Chegar no horário.' });

    const semTermo = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 2, termoCompromisso: null })
      .expect(200);
    expect(semTermo.body as RegistrationBody).toMatchObject({ versao: 3, termoCompromisso: null });

    const vazio = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 3, termoCompromisso: '   ' })
      .expect(400);
    expect((vazio.body as { code: string }).code).toBe('VALIDATION_ERROR');
  });

  it('abre com apresentacao, prazo e WhatsApp do Instituto, edita e limpa com a trilha do que mudou', async () => {
    await prisma.atividade.update({
      where: { id: atividadeId },
      data: { data: new Date(`${day(30)}T00:00:00.000Z`) },
    });
    const inscricao = await opened({
      ...VALID,
      apresentacao: '  Oficina de 8 horas, com certificado.  ',
      prazoInscricao: day(20),
      contatoWhatsapp: '+55 (61) 99999-8888',
    });
    expect(inscricao).toMatchObject({
      apresentacao: 'Oficina de 8 horas, com certificado.',
      prazoInscricao: day(20),
      contatoWhatsapp: '61999998888',
    });

    const editada = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, apresentacao: 'Oficina de 8 horas. Não há almoço.' })
      .expect(200);
    expect((editada.body as RegistrationBody).versao).toBe(2);
    const edicao = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: atividadeId, acao: 'REGISTRATION_UPDATED' },
    });
    expect(edicao.antes).toEqual({ apresentacao: 'Oficina de 8 horas, com certificado.' });

    const limpa = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 2, apresentacao: null, prazoInscricao: null, contatoWhatsapp: null })
      .expect(200);
    expect(limpa.body as RegistrationBody).toMatchObject({
      versao: 3,
      apresentacao: null,
      prazoInscricao: null,
      contatoWhatsapp: null,
    });
  });

  it.each([
    ['apresentacao longa demais', { apresentacao: 'a'.repeat(2001) }],
    ['apresentacao em branco', { apresentacao: '   ' }],
    ['prazo fora do formato de data', { prazoInscricao: '05/11/2026' }],
    ['WhatsApp sem DDD', { contatoWhatsapp: '99998888' }],
  ])('recusa %s com 400', async (_caso, extra) => {
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(path(), { ...VALID, ...extra })
      .expect(400);
    expect(await prisma.configuracaoInscricao.count()).toBe(0);
  });

  it('nao deixa tirar do formulario o campo que identifica cadastro repetido', async () => {
    await opened();

    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, camposAdicionais: ['EMAIL'] })
      .expect(400);
    expect((res.body as { code: string }).code).toBe('DUPLICATE_KEY_NOT_ASKED');
  });

  it('edicao sem mudanca, mesmo com os campos em outra ordem, nao sobe a versao', async () => {
    await opened();

    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: 1, camposAdicionais: ['CPF', 'EMAIL'], vagas: 30 })
      .expect(200);
    expect((res.body as RegistrationBody).versao).toBe(1);
    expect(
      await prisma.trilhaAuditoria.count({
        where: { entidadeId: atividadeId, acao: 'REGISTRATION_UPDATED' },
      }),
    ).toBe(0);
  });

  it('a lista de atividades traz a situacao da inscricao e os inscritos', async () => {
    type Row = {
      id: string;
      inscricao: { aberta: boolean; vagas: number; inscritos: number } | null;
    };
    const lista = async () =>
      (
        (
          await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
            .get(`/v1/projects/${projetoId}/activities`)
            .expect(200)
        ).body as Row[]
      ).reduce<Record<string, Row['inscricao']>>(
        (acc, row) => ({ ...acc, [row.id]: row.inscricao }),
        {},
      );

    expect((await lista())[atividadeId]).toBeNull();
    const aberta = await opened();
    expect((await lista())[atividadeId]).toEqual({ aberta: true, vagas: 30, inscritos: 0 });
    expect((await lista())[outraAtividadeId]).toBeNull();

    await as(Perfil.NUCLEO_PEDAGOGICO)
      .patch(path(), { versao: aberta.versao, aberta: false })
      .expect(200);
    expect((await lista())[atividadeId]).toMatchObject({ aberta: false });
  });

  it('consulta a configuracao, e informa quando a inscricao ainda nao foi aberta', async () => {
    const naoAberta = await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get(path()).expect(404);
    expect((naoAberta.body as { code: string }).code).toBe('REGISTRATION_NOT_OPENED');

    await opened();
    const res = await as(Perfil.ADMINISTRATIVO_FINANCEIRO).get(path()).expect(200);
    expect((res.body as RegistrationBody).vagas).toBe(30);

    await as(Perfil.NUCLEO_PEDAGOGICO)
      .get(path('00000000-0000-4000-8000-000000000000'))
      .expect(404);
  });

  it('instrumento inativo nao abre nem altera inscricao', async () => {
    await opened();
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });

    const abrir = await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(path(outraAtividadeId), VALID)
      .expect(409);
    expect((abrir.body as { code: string }).code).toBe('INSTRUMENT_INACTIVE');
    await as(Perfil.NUCLEO_PEDAGOGICO).patch(path(), { versao: 1, vagas: 10 }).expect(409);
  });

  it('acesso por perfil: nucleo e gestao configuram, financeiro consulta, os demais nao acessam', async () => {
    await as(Perfil.PRESIDENCIA_GESTAO).post(path(outraAtividadeId), VALID).expect(201);
    await opened();

    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).post(path(), VALID).expect(403);
    await as(Perfil.ADMINISTRATIVO_FINANCEIRO).patch(path(), { versao: 1, vagas: 5 }).expect(403);
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(path()).expect(403);
      await as(perfil).patch(path(), { versao: 1, vagas: 5 }).expect(403);
    }
    expect(
      (await prisma.configuracaoInscricao.findUniqueOrThrow({ where: { atividadeId } })).vagas,
    ).toBe(30);
  });
});
