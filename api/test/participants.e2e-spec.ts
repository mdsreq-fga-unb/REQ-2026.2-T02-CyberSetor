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

const PASSWORD = 'senha longa de quem testa';
const CPF_ANA = '52998224725';
const CPF_NOVO = '11144477735';
const CPF_BRUNO = '39053344705';

interface ErrorBody {
  code: string;
  details: { campos?: string[]; errors?: string[] };
}

interface Summary {
  id: string;
  nome: string;
  nomePreferencia: string | null;
  idade: number;
  inscricoes: number;
  ultimaAtividade: { titulo: string } | null;
}

interface Participant {
  id: string;
  versao: number;
  nome: string;
  nomePreferencia: string | null;
  telefone: string;
  cpf: string | null;
  email: string | null;
  inscricoes: {
    atividade: { titulo: string };
    autorizaImagem: boolean;
    responsavelNome: string | null;
  }[];
}

/** Data de nascimento de alguém com `anos` completos hoje (UTC basta para o teste). */
function bornYearsAgo(anos: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - anos);
  date.setUTCDate(date.getUTCDate() - 2);
  return date.toISOString().slice(0, 10);
}

describe('Participantes: busca, ficha e correção a pedido do titular (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  let ana: string;
  let bruno: string;

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
        dataCelebracao: new Date('2026-03-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-04-01T00:00:00.000Z'),
        vigenciaFim: new Date('2027-03-31T00:00:00.000Z'),
      },
    });
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId: instrumento.id,
        coordenadorId: coordenador.id,
        codigo: 'P01',
        titulo: 'Cultura Viva',
        inicio: new Date('2026-05-01T00:00:00.000Z'),
        fim: new Date('2026-12-15T00:00:00.000Z'),
      },
    });
    const modalidade = await prisma.modalidade.create({ data: { nome: 'Oficina' } });
    const atividade = async (
      titulo: string,
      data: string,
      campos: CampoInscricao[],
      chave: CampoDuplicidade,
    ) => {
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
          vagas: 30,
          camposAdicionais: campos,
          campoDuplicidade: chave,
          codigoPublico: `codigo${titulo.length}${data.replaceAll('-', '')}`.slice(0, 16),
        },
      });
      return nova.id;
    };
    const serigrafia = await atividade(
      'Serigrafia',
      '2026-11-10',
      [CampoInscricao.CPF],
      CampoDuplicidade.CPF,
    );
    const danca = await atividade(
      'Dança',
      '2026-11-20',
      [CampoInscricao.EMAIL],
      CampoDuplicidade.EMAIL,
    );

    const participante = (nome: string, telefone: string, cpf: string, email: string | null) =>
      prisma.participante.create({
        data: { nome, telefone, dataNascimento: new Date('1990-05-20'), cpf, email },
      });
    const inscreve = (participanteId: string, atividadeId: string, chave: string, dias = 0) =>
      prisma.inscricao.create({
        data: {
          atividadeId,
          participanteId,
          chaveDuplicidade: chave,
          versaoAviso: 'v1',
          avisoApresentadoEm: new Date(),
          autorizaComunicados: true,
          autorizaImagem: false,
          criadoEm: new Date(Date.now() + dias * 1000),
        },
      });
    ana = (await participante('Ana Souza', '61999998888', CPF_ANA, 'ana@exemplo.test')).id;
    bruno = (await participante('Bruno Lima', '61977776666', CPF_BRUNO, null)).id;
    await inscreve(ana, serigrafia, CPF_ANA);
    await inscreve(ana, danca, 'ana@exemplo.test', 5);
    await inscreve(bruno, serigrafia, CPF_BRUNO);
  });

  afterAll(async () => {
    await app.close();
  });

  function as(perfil: Perfil) {
    const server = request(app.getHttpServer());
    const auth = `Bearer ${tokens[perfil]}`;
    return {
      get: (path: string) => server.get(path).set('Authorization', auth),
      patch: (path: string, body: object) =>
        server.patch(path).set('Authorization', auth).send(body),
    };
  }
  const nucleo = () => as(Perfil.NUCLEO_PEDAGOGICO);
  const corrige = (id: string, body: object) =>
    nucleo().patch(`/v1/participants/${id}`, {
      versao: 1,
      justificativa: 'Pedido da titular por telefone em 28/10.',
      ...body,
    });

  it('so o Nucleo Pedagogico acessa as fichas; os demais recebem 403', async () => {
    await nucleo().get('/v1/participants').expect(200);
    for (const perfil of [
      Perfil.PRESIDENCIA_GESTAO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.CONCEDENTE_AUDITORIA,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await as(perfil).get('/v1/participants').expect(403);
      await as(perfil).get(`/v1/participants/${ana}`).expect(403);
      await as(perfil).patch(`/v1/participants/${ana}`, { versao: 1 }).expect(403);
    }
    await request(app.getHttpServer()).get('/v1/participants').expect(401);
  });

  it('busca por nome, telefone ou e-mail, com idade, inscricoes e a ultima atividade', async () => {
    const todos = (await nucleo().get('/v1/participants').expect(200)).body as Summary[];
    expect(todos.map((p) => p.nome)).toEqual(['Ana Souza', 'Bruno Lima']);
    expect(todos[0]).toMatchObject({ inscricoes: 2, ultimaAtividade: { titulo: 'Dança' } });
    expect(todos[0].idade).toBeGreaterThanOrEqual(36);

    const busca = async (termo: string) =>
      (
        (
          await nucleo()
            .get(`/v1/participants?busca=${encodeURIComponent(termo)}`)
            .expect(200)
        ).body as Summary[]
      ).map((p) => p.nome);
    expect(await busca('ana')).toEqual(['Ana Souza']);
    expect(await busca('(61) 97777')).toEqual(['Bruno Lima']);
    expect(await busca('ANA@exemplo')).toEqual(['Ana Souza']);
    expect(await busca('ninguem')).toEqual([]);

    await prisma.participante.update({
      where: { id: bruno },
      data: { nomePreferencia: 'Bruninho' },
    });
    expect(await busca('bruninho')).toEqual(['Bruno Lima']);
    expect(todos[0].nomePreferencia).toBeNull();
  });

  it('ficha com as inscricoes, as autorizacoes e o responsavel', async () => {
    const ficha = (await nucleo().get(`/v1/participants/${ana}`).expect(200)).body as Participant;
    expect(ficha).toMatchObject({ nome: 'Ana Souza', cpf: CPF_ANA, versao: 1 });
    expect(ficha.inscricoes.map((i) => i.atividade.titulo)).toEqual(['Dança', 'Serigrafia']);
    expect(ficha.inscricoes[0]).toMatchObject({ autorizaImagem: false, responsavelNome: null });
    await nucleo().get('/v1/participants/00000000-0000-4000-8000-000000000000').expect(404);
  });

  it('corrige com justificativa, atualiza a chave de cadastro repetido e a trilha nao guarda valores', async () => {
    const res = await corrige(ana, {
      nome: 'Ana Souza Lima',
      telefone: '+55 (61) 98888-7777',
      cpf: '111.444.777-35',
    }).expect(200);
    expect(res.body as Participant).toMatchObject({
      versao: 2,
      nome: 'Ana Souza Lima',
      telefone: '61988887777',
      cpf: CPF_NOVO,
    });

    const chaves = await prisma.inscricao.findMany({
      where: { participanteId: ana },
      select: { chaveDuplicidade: true },
      orderBy: { criadoEm: 'asc' },
    });
    expect(chaves.map((c) => c.chaveDuplicidade)).toEqual([CPF_NOVO, 'ana@exemplo.test']);

    const trilha = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { acao: 'PARTICIPANT_CORRECTED', entidadeId: ana },
    });
    expect(trilha.usuarioId).not.toBeNull();
    expect(trilha.depois).toEqual({
      campos: ['nome', 'telefone', 'cpf'],
      justificativa: 'Pedido da titular por telefone em 28/10.',
    });
    const registro = JSON.stringify(trilha);
    for (const valor of ['Lima', '61988887777', CPF_NOVO, CPF_ANA]) {
      expect(registro).not.toContain(valor);
    }
  });

  it('corrige e apaga o nome de preferencia a pedido do titular', async () => {
    const res = await corrige(ana, { nomePreferencia: 'Aninha' }).expect(200);
    expect(res.body as Participant).toMatchObject({ versao: 2, nomePreferencia: 'Aninha' });

    const apagado = await corrige(ana, { versao: 2, nomePreferencia: null }).expect(200);
    expect(apagado.body as Participant).toMatchObject({ versao: 3, nomePreferencia: null });
  });

  it('sem justificativa a correcao e recusada no campo da justificativa', async () => {
    const res = await nucleo()
      .patch(`/v1/participants/${ana}`, { versao: 1, nome: 'Ana S.', justificativa: 'curta' })
      .expect(400);
    expect((res.body as ErrorBody).details.errors?.join(' ')).toContain('pedido do titular');
    const semCampo = await nucleo()
      .patch(`/v1/participants/${ana}`, { versao: 1, nome: 'Ana S.' })
      .expect(400);
    expect((semCampo.body as ErrorBody).details.errors?.join(' ')).toContain('justificativa');
  });

  it('recusa versao antiga, CPF invalido, data futura, campo pedido vazio e menor sem responsavel', async () => {
    await corrige(ana, { nome: 'Ana Souza Lima' }).expect(200);
    const antiga = await corrige(ana, { nome: 'Outra' }).expect(409);
    expect((antiga.body as ErrorBody).code).toBe('VERSION_CONFLICT');

    const casos: [object, string][] = [
      [{ cpf: '529.982.247-24' }, 'INVALID_CPF'],
      [{ dataNascimento: '2999-01-01' }, 'INVALID_BIRTH_DATE'],
      [{ cpf: null }, 'FIELD_REQUIRED_BY_FORM'],
      [{ dataNascimento: bornYearsAgo(15) }, 'GUARDIAN_REQUIRED'],
    ];
    for (const [body, code] of casos) {
      const res = await corrige(bruno, body).expect(400);
      expect((res.body as ErrorBody).code).toBe(code);
    }
    const vazio = await corrige(bruno, { cpf: null }).expect(400);
    expect((vazio.body as ErrorBody).details.campos).toEqual(['cpf']);
    expect((await prisma.participante.findUniqueOrThrow({ where: { id: bruno } })).versao).toBe(1);
  });

  it('CPF ja usado por outra inscricao na mesma atividade e recusado sem alterar nada', async () => {
    const res = await corrige(bruno, { cpf: CPF_ANA }).expect(409);
    expect((res.body as ErrorBody).code).toBe('REGISTRATION_KEY_TAKEN');
    const atual = await prisma.participante.findUniqueOrThrow({ where: { id: bruno } });
    expect(atual).toMatchObject({ versao: 1, cpf: CPF_BRUNO });
  });

  it('chave guardada acompanha o dado copiado mesmo depois de a configuracao mudar', async () => {
    // Dança usava o e-mail como chave; a configuração passa a pedir só o CPF.
    const danca = await prisma.inscricao.findFirstOrThrow({
      where: { participanteId: ana, chaveDuplicidade: 'ana@exemplo.test' },
    });
    await prisma.configuracaoInscricao.update({
      where: { atividadeId: danca.atividadeId },
      data: { campoDuplicidade: 'CPF', camposAdicionais: [CampoInscricao.CPF] },
    });

    await corrige(ana, { email: 'ana.souza@exemplo.test' }).expect(200);
    expect(
      (await prisma.inscricao.findUniqueOrThrow({ where: { id: danca.id } })).chaveDuplicidade,
    ).toBe('ana.souza@exemplo.test');

    await nucleo()
      .patch(`/v1/participants/${ana}`, {
        versao: 2,
        justificativa: 'Titular pediu para apagar o e-mail.',
        email: null,
      })
      .expect(200);
    const chave = (await prisma.inscricao.findUniqueOrThrow({ where: { id: danca.id } }))
      .chaveDuplicidade;
    expect(chave).toBe(`apagado:${danca.id}`);
  });

  it('busca trata % e _ como texto e avisa quando a lista passa do limite', async () => {
    const busca = (termo: string) =>
      nucleo()
        .get(`/v1/participants?busca=${encodeURIComponent(termo)}`)
        .expect(200);
    expect((await busca('%')).body).toEqual([]);
    expect((await busca('_')).body).toEqual([]);

    await prisma.participante.createMany({
      data: Array.from({ length: 205 }, (_, i) => ({
        nome: `Pessoa ${String(i).padStart(3, '0')}`,
        telefone: '61900000000',
        dataNascimento: new Date('1995-01-01'),
      })),
    });
    const todos = (await nucleo().get('/v1/participants').expect(200)).body as Summary[];
    expect(todos).toHaveLength(201);
  });

  it('pode apagar um dado que nenhum formulario pede; sem mudanca, nada e gravado', async () => {
    const res = await corrige(bruno, { email: null, bairroRegiao: null }).expect(200);
    expect((res.body as Participant).versao).toBe(1);
    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'PARTICIPANT_CORRECTED' } })).toBe(
      0,
    );

    const comEmail = await corrige(bruno, { email: 'Bruno@Exemplo.test' }).expect(200);
    expect((comEmail.body as Participant).email).toBe('bruno@exemplo.test');
    const apagado = await nucleo()
      .patch(`/v1/participants/${bruno}`, {
        versao: 2,
        justificativa: 'Titular pediu para retirar o e-mail.',
        email: null,
      })
      .expect(200);
    expect((apagado.body as Participant).email).toBeNull();
  });
});
