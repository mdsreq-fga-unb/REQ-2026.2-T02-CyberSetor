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
  TipoInstrumento,
} from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { DATA_NOTICE } from '../src/public-registrations/notice.js';

const ADULTO = {
  nome: 'Ana Souza',
  telefone: '(61) 99999-8888',
  dataNascimento: '1990-05-20',
  cpf: '529.982.247-25',
  versaoAviso: DATA_NOTICE.versao,
  autorizaComunicados: true,
  autorizaImagem: false,
};

interface ErrorBody {
  code: string;
  message: string;
  details: { campos?: string[] };
}

/** Data de nascimento de alguém com `anos` completos hoje (UTC basta para o teste). */
function bornYearsAgo(anos: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - anos);
  date.setUTCDate(date.getUTCDate() - 2);
  return date.toISOString().slice(0, 10);
}

describe('Formulário público de inscrição (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let instrumentoId: string;
  let atividadeId: string;
  let codigo: string;
  let outroCodigo: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Coordenação' } });
    const senhaHash = await app.get(PasswordService).hash('senha longa de quem testa');
    await prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin: 'nucleo@instituto.test',
        senhaHash,
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: false,
      },
    });
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, inscricao, participante, configuracao_inscricao, atividade_meta, atividade, modalidade, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    const coordenador = await prisma.usuario.findUniqueOrThrow({
      where: { emailLogin: 'nucleo@instituto.test' },
    });
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
        coordenadorId: coordenador.id,
        codigo: 'P01',
        titulo: 'Cultura Viva no SCS',
        inicio: new Date('2026-05-01T00:00:00.000Z'),
        fim: new Date('2026-12-15T00:00:00.000Z'),
      },
    });
    const modalidade = await prisma.modalidade.create({ data: { nome: 'Oficina contínua' } });
    const atividade = (titulo: string) =>
      prisma.atividade.create({
        data: {
          projetoId: projeto.id,
          modalidadeId: modalidade.id,
          responsavelId: coordenador.id,
          titulo,
          data: new Date('2026-11-10T00:00:00.000Z'),
          local: 'Setor Comercial Sul',
        },
      });
    atividadeId = (await atividade('Oficina de serigrafia')).id;
    const outraId = (await atividade('Oficina de fotografia')).id;
    const config = (id: string, codigoPublico: string) =>
      prisma.configuracaoInscricao.create({
        data: {
          atividadeId: id,
          vagas: 30,
          camposAdicionais: [CampoInscricao.CPF],
          campoDuplicidade: CampoDuplicidade.CPF,
          codigoPublico,
        },
      });
    codigo = (await config(atividadeId, 'codigoPublicoA01')).codigoPublico;
    outroCodigo = (await config(outraId, 'codigoPublicoB02')).codigoPublico;
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => request(app.getHttpServer());
  const enviar = (body: object, cod = codigo) =>
    server().post(`/v1/public/registrations/${cod}`).send(body);

  it('abre o formulario sem login, com a atividade, os campos e o aviso de dados', async () => {
    const res = await server().get(`/v1/public/registrations/${codigo}`).expect(200);

    expect(res.body).toEqual({
      atividade: {
        titulo: 'Oficina de serigrafia',
        data: '2026-11-10',
        local: 'Setor Comercial Sul',
      },
      aberta: true,
      camposMinimos: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
      camposAdicionais: ['CPF'],
      aviso: { versao: DATA_NOTICE.versao, texto: DATA_NOTICE.texto },
    });
  });

  it('link inexistente ou com formato invalido devolve 404', async () => {
    const naoExiste = await server().get('/v1/public/registrations/codigoQueNaoExis').expect(404);
    expect((naoExiste.body as ErrorBody).code).toBe('REGISTRATION_LINK_NOT_FOUND');
    await server().get('/v1/public/registrations/curto').expect(404);
  });

  it('inscreve adulto, guarda a versao do aviso e as autorizacoes, sem dado pessoal na trilha', async () => {
    const res = await enviar(ADULTO).expect(201);

    expect(res.body).toMatchObject({
      situacao: 'CONFIRMADA',
      atividade: { titulo: 'Oficina de serigrafia' },
    });
    const inscricao = await prisma.inscricao.findFirstOrThrow({ include: { participante: true } });
    expect(inscricao).toMatchObject({
      atividadeId,
      versaoAviso: DATA_NOTICE.versao,
      autorizaComunicados: true,
      autorizaImagem: false,
      responsavelNome: null,
      chaveDuplicidade: '52998224725',
    });
    expect(inscricao.participante).toMatchObject({
      telefone: '61999998888',
      cpf: '52998224725',
      email: null,
    });
    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidadeId: inscricao.id },
    });
    expect(trilha).toMatchObject({
      acao: 'REGISTRATION_SUBMITTED',
      autorTipo: 'PUBLICO',
      usuarioId: null,
    });
    expect(trilha.depois).toEqual({ atividadeId, situacao: 'CONFIRMADA' });
  });

  it('menor de 18 anos exige o responsavel legal, e adulto nao guarda responsavel', async () => {
    const menor = { ...ADULTO, dataNascimento: bornYearsAgo(15), cpf: '111.444.777-35' };
    const semResponsavel = await enviar(menor).expect(400);
    expect((semResponsavel.body as ErrorBody).code).toBe('GUARDIAN_REQUIRED');

    await enviar({
      ...menor,
      responsavelNome: 'Carla Souza',
      responsavelTelefone: '61988887777',
    }).expect(201);
    await enviar({
      ...ADULTO,
      responsavelNome: 'Alguém',
      responsavelTelefone: '61988887777',
    }).expect(201);

    const responsaveis = await prisma.inscricao.findMany({
      orderBy: { criadoEm: 'asc' },
      select: { responsavelNome: true },
    });
    expect(responsaveis.map((item) => item.responsavelNome)).toEqual(['Carla Souza', null]);
  });

  it('recusar as duas autorizacoes nao impede a inscricao', async () => {
    await enviar({ ...ADULTO, autorizaComunicados: false, autorizaImagem: false }).expect(201);
  });

  it('envio repetido na mesma atividade nao duplica nem revela dados; em outra atividade e aceito', async () => {
    await enviar(ADULTO).expect(201);

    const repetido = await enviar({ ...ADULTO, nome: 'Outra pessoa', cpf: '52998224725' }).expect(
      409,
    );
    expect(repetido.body as ErrorBody).toMatchObject({
      code: 'ALREADY_REGISTERED',
      message: 'Já existe uma inscrição com estes dados nesta atividade.',
    });
    expect(JSON.stringify(repetido.body)).not.toContain('Ana');

    await enviar(ADULTO, outroCodigo).expect(201);
    expect(await prisma.inscricao.count({ where: { atividadeId } })).toBe(1);
  });

  it.each([
    ['campo nao pedido', { ...ADULTO, email: 'ana@exemplo.com' }, 'FIELD_NOT_ASKED'],
    ['campo pedido ausente', { ...ADULTO, cpf: undefined }, 'MISSING_FIELDS'],
    ['CPF com digito errado', { ...ADULTO, cpf: '529.982.247-24' }, 'INVALID_CPF'],
    ['aviso de outra versao', { ...ADULTO, versaoAviso: '2020-01-01' }, 'NOTICE_OUTDATED'],
    ['nascimento no futuro', { ...ADULTO, dataNascimento: '2999-01-01' }, 'INVALID_BIRTH_DATE'],
  ])('recusa %s com 400', async (_caso, body, code) => {
    const res = await enviar(body).expect(400);
    expect((res.body as ErrorBody).code).toBe(code);
    expect(await prisma.inscricao.count()).toBe(0);
  });

  it('inscricao encerrada ou instrumento inativo fecham o formulario', async () => {
    await prisma.configuracaoInscricao.update({ where: { atividadeId }, data: { aberta: false } });
    const encerrada = await server().get(`/v1/public/registrations/${codigo}`).expect(200);
    expect((encerrada.body as { aberta: boolean }).aberta).toBe(false);
    const recusa = await enviar(ADULTO).expect(409);
    expect((recusa.body as ErrorBody).code).toBe('REGISTRATION_CLOSED');

    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });
    const inativo = await server().get(`/v1/public/registrations/${outroCodigo}`).expect(200);
    expect((inativo.body as { aberta: boolean }).aberta).toBe(false);
  });
});
