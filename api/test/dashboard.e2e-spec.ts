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

interface Panel {
  hoje: string;
  resumo: Record<string, number>;
  prazos: { objetivo: string; alerta: string | null; responsavel: { nome: string } | null }[];
  semResponsavel: { objetivo: string }[];
  proximasAtividades: {
    titulo: string;
    inscricao: {
      aberta: boolean;
      vagas: number;
      inscritos: number;
      linkPublico: string;
    } | null;
  }[];
  vigencias: { numeroProcesso: string }[];
}

interface Dashboard {
  usuario: { nome: string; perfil: string; setor: { nome: string } | null };
  painel: Panel | null;
  contas: { ativas: number; bloqueadas: number; aguardandoPrimeiroAcesso: number } | null;
}

function brasilia(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(Date.now() + offsetDays * DAY),
  );
}

const day = (offsetDays: number) => new Date(`${brasilia(offsetDays)}T00:00:00.000Z`);

describe('Painel da tela inicial (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;

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
    const setor = await prisma.setor.create({ data: { nome: 'Pedagógico' } });
    for (const perfil of Object.values(Perfil)) {
      const pessoa = await prisma.pessoa.create({
        data: {
          nome: `Pessoa ${perfil}`,
          setorId: perfil === Perfil.NUCLEO_PEDAGOGICO ? setor.id : null,
        },
      });
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
    // Conta que ainda não trocou a senha temporária e conta bloqueada, para o resumo da administração.
    const novata = await prisma.pessoa.create({ data: { nome: 'Novata' } });
    await prisma.usuario.create({
      data: {
        pessoaId: novata.id,
        emailLogin: 'novata@instituto.test',
        senhaHash,
        perfil: Perfil.NUCLEO_PEDAGOGICO,
        deveTrocarSenha: true,
        bloqueadoAte: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const instrumento = async (numeroProcesso: string, ativo: boolean, fim: number) =>
      prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.PARCERIA,
          orgaoConcedente: 'Secretaria de Cultura',
          numeroProcesso,
          valorGlobal: '100000.00',
          dataCelebracao: day(-200),
          vigenciaInicio: day(-180),
          vigenciaFim: day(fim),
          ativo,
        },
      });
    const ativo = await instrumento('P-ATIVO', true, 200);
    await instrumento('P-PROXIMO', true, 40);
    const inativo = await instrumento('P-INATIVO', false, 10);

    const projeto = async (instrumentoId: string, codigo: string) =>
      prisma.projeto.create({
        data: {
          instrumentoId,
          coordenadorId: ids[Perfil.NUCLEO_PEDAGOGICO],
          codigo,
          titulo: `Projeto ${codigo}`,
          inicio: day(-170),
          fim: day(190),
        },
      });
    const p1 = await projeto(ativo.id, 'P01');
    const p2 = await projeto(inativo.id, 'P02');

    const meta = async (
      projetoId: string,
      ordem: number,
      objetivo: string,
      fim: number | null,
      extra: { responsavelId?: string | null; situacao?: 'CONCLUIDA' } = {},
    ) =>
      prisma.meta.create({
        data: {
          projetoId,
          ordem,
          origem: 'EDITAL',
          objetivo,
          descricao: objetivo,
          periodoFim: fim === null ? null : day(fim),
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
          ...extra,
        },
      });
    await meta(p1.id, 1, 'Vencida', -3);
    await meta(p1.id, 2, 'Vencendo sem responsavel', 10, { responsavelId: null });
    await meta(p1.id, 3, 'Futura', 90);
    await meta(p1.id, 4, 'Concluida vencida', -5, { situacao: 'CONCLUIDA' });
    await meta(p1.id, 5, 'Vence hoje', 0, { responsavelId: ids[Perfil.PRESIDENCIA_GESTAO] });
    await meta(p2.id, 1, 'De instrumento inativo', -1);

    const modalidade = await prisma.modalidade.create({ data: { nome: 'Oficina' } });
    const atividade = async (projetoId: string, titulo: string, offset: number) =>
      prisma.atividade.create({
        data: {
          projetoId,
          modalidadeId: modalidade.id,
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
          titulo,
          data: day(offset),
          local: 'Sede',
        },
      });
    const aberta = await atividade(p1.id, 'Oficina com inscricao', 5);
    await atividade(p1.id, 'Roda de conversa', 20);
    await atividade(p1.id, 'Mostra distante', 60);
    await atividade(p2.id, 'Do instrumento inativo', 3);
    await prisma.configuracaoInscricao.create({
      data: {
        atividadeId: aberta.id,
        aberta: true,
        vagas: 30,
        camposAdicionais: [],
        campoDuplicidade: 'EMAIL',
        codigoPublico: 'codigoPainel0001',
      },
    });
    for (const nome of ['Ana', 'Bia']) {
      const participante = await prisma.participante.create({
        data: { nome, telefone: '61999998888', dataNascimento: new Date('2000-01-01') },
      });
      await prisma.inscricao.create({
        data: {
          atividadeId: aberta.id,
          participanteId: participante.id,
          chaveDuplicidade: `${nome}@exemplo.test`,
          versaoAviso: 'v1',
          avisoApresentadoEm: new Date(),
          autorizaComunicados: false,
          autorizaImagem: false,
        },
      });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (perfil: Perfil) =>
    request(app.getHttpServer())
      .get('/v1/dashboard')
      .set('Authorization', `Bearer ${tokens[perfil]}`)
      .expect(200)
      .then((res) => res.body as Dashboard);

  it('quem acompanha metas recebe o painel com as contagens de hoje em Brasilia', async () => {
    const body = await get(Perfil.NUCLEO_PEDAGOGICO);
    expect(body.usuario).toMatchObject({
      nome: 'Pessoa NUCLEO_PEDAGOGICO',
      perfil: 'NUCLEO_PEDAGOGICO',
      setor: { nome: 'Pedagógico' },
    });
    expect(body.contas).toBeNull();
    expect(body.painel?.hoje).toBe(brasilia(0));
    expect(body.painel?.resumo).toEqual({
      minhasMetas: 2,
      metasVencendo: 2,
      metasVencidas: 1,
      metasSemResponsavel: 1,
      inscricoesAbertas: 1,
      atividadesProximas: 2,
    });
  });

  it('prazos em ordem, com o alerta; concluida e instrumento inativo ficam fora', async () => {
    const painel = (await get(Perfil.PRESIDENCIA_GESTAO)).painel!;
    expect(painel.prazos.map((m) => [m.objetivo, m.alerta])).toEqual([
      ['Vencida', 'VENCIDA'],
      ['Vence hoje', 'VENCENDO'],
      ['Vencendo sem responsavel', 'VENCENDO'],
    ]);
    expect(painel.prazos[2].responsavel).toBeNull();
    expect(painel.prazos[1].responsavel?.nome).toBe('Pessoa PRESIDENCIA_GESTAO');
    expect(painel.semResponsavel.map((m) => m.objetivo)).toEqual(['Vencendo sem responsavel']);
    expect(painel.resumo.minhasMetas).toBe(1);
  });

  it('proximas atividades em 30 dias com a inscricao e as vigencias do fim mais proximo', async () => {
    const painel = (await get(Perfil.ADMINISTRATIVO_FINANCEIRO)).painel!;
    expect(painel.proximasAtividades).toEqual([
      expect.objectContaining({
        titulo: 'Oficina com inscricao',
        inscricao: {
          aberta: true,
          vagas: 30,
          inscritos: 2,
          linkPublico: '/inscrever/codigoPainel0001',
        },
      }),
      expect.objectContaining({ titulo: 'Roda de conversa', inscricao: null }),
    ]);
    expect(painel.vigencias.map((v) => v.numeroProcesso)).toEqual(['P-PROXIMO', 'P-ATIVO']);
  });

  it('administracao recebe o resumo das contas, sem o painel', async () => {
    const body = await get(Perfil.ADMINISTRACAO_SISTEMA);
    expect(body.painel).toBeNull();
    expect(body.contas).toEqual({ ativas: 6, bloqueadas: 1, aguardandoPrimeiroAcesso: 1 });
  });

  it('orgao concedente recebe so a identificacao; sem sessao, 401', async () => {
    const body = await get(Perfil.CONCEDENTE_AUDITORIA);
    expect(body).toEqual({
      usuario: { nome: 'Pessoa CONCEDENTE_AUDITORIA', perfil: 'CONCEDENTE_AUDITORIA', setor: null },
      painel: null,
      contas: null,
    });
    await request(app.getHttpServer()).get('/v1/dashboard').expect(401);
  });
});
