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
});
