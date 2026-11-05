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
const MISSING = '00000000-0000-4000-8000-000000000000';
const FROM = '2025-04-01';
const TO = '2025-06-30';
const FREE_TEXT = 'Lista conferida por Joana Testemunha';

const NAMES: Record<Perfil, string> = {
  PRESIDENCIA_GESTAO: 'Beatriz Gestão',
  NUCLEO_PEDAGOGICO: 'Ana Pedagógica',
  ADMINISTRATIVO_FINANCEIRO: 'Carla Financeiro',
  CONCEDENTE_AUDITORIA: 'Davi Auditoria',
  ADMINISTRACAO_SISTEMA: 'Eva Administração',
};

interface ErrorBody {
  code: string;
}

function lines(csv: string): string[] {
  return csv.replace(/^﻿/, '').split('\r\n');
}

describe('Exportação dos dados do projeto em planilha (e2e, HU-13)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let projetoId: string;
  let requisitoId: string;
  let modalidadeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, atividade_meta, atividade, modalidade, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
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
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, atividade_meta, atividade, modalidade, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );

    const instrumentoId = (
      await prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.PARCERIA,
          orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
          numeroProcesso: '00150-00009999/2025-01',
          valorGlobal: '250000.00',
          dataCelebracao: new Date('2024-12-10T00:00:00.000Z'),
          vigenciaInicio: new Date('2025-01-01T00:00:00.000Z'),
          vigenciaFim: new Date('2030-12-31T00:00:00.000Z'),
        },
      })
    ).id;

    projetoId = (
      await prisma.projeto.create({
        data: {
          instrumentoId,
          coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO],
          codigo: 'P01',
          titulo: 'Oficinas Culturais no Setor',
          inicio: new Date('2025-01-01T00:00:00.000Z'),
          fim: new Date('2029-12-31T00:00:00.000Z'),
        },
      })
    ).id;

    requisitoId = (
      await prisma.requisitoInstrumento.create({
        data: {
          instrumentoId,
          referencia: 'Cláusula 3.1',
          descricao: 'Executar formação cultural gratuita para jovens',
        },
      })
    ).id;

    modalidadeId = (
      await prisma.modalidade.create({
        data: { nome: 'Oficina contínua', descricao: 'Encontros regulares' },
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
    };
  }

  function exportPath(query: string, id = projetoId): string {
    return `/v1/projects/${id}/export?${query}`;
  }

  async function createGoal(
    modalidadeAfericao: ModalidadeAfericao = ModalidadeAfericao.QUANTITATIVA,
  ): Promise<string> {
    const quantitativa = modalidadeAfericao === ModalidadeAfericao.QUANTITATIVA;
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: quantitativa ? OrigemMeta.EDITAL : OrigemMeta.PROJETO,
        objetivo: quantitativa
          ? 'Formar jovens em oficinas artísticas'
          : 'Promover difusão cultural comunitária',
        descricao: quantitativa
          ? 'Realizar oficinas com 100 participantes'
          : 'Realizar mostra aberta à comunidade',
        requisitoIds: [requisitoId],
        indicador: quantitativa
          ? 'Participantes com frequência mínima de 75%'
          : 'Mostra realizada com registro audiovisual',
        modalidadeAfericao,
        ...(quantitativa ? { parametroPlanejado: '100', unidade: 'participantes' } : {}),
        periodoInicio: '2025-01-10',
        periodoFim: '2025-06-30',
        frequenciaApuracao: 'Semestral',
        formaComprovacao: 'Lista de presença e registro fotográfico',
        responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      })
      .expect(201);
    return (res.body as { id: string }).id;
  }

  async function recordResult(
    goalId: string,
    payload: { dataReferencia: string; valorAlcancado?: number; alcance?: AlcanceMeta },
  ): Promise<void> {
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(`/v1/goals/${goalId}/results`, { descricao: FREE_TEXT, ...payload })
      .expect(201);
  }

  async function createActivity(data: string, titulo: string, metaIds: string[]): Promise<void> {
    await prisma.atividade.create({
      data: {
        projetoId,
        modalidadeId,
        responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
        titulo,
        data: new Date(`${data}T00:00:00.000Z`),
        horaInicio: new Date('1970-01-01T09:00:00.000Z'),
        horaFim: new Date('1970-01-01T12:00:00.000Z'),
        cargaHorariaMinutos: 150,
        local: 'Galpão Cultural SCS',
        metas: { create: metaIds.map((metaId) => ({ metaId })) },
      },
    });
  }

  /** Meta quantitativa com resultados antes e dentro do período, qualitativa e uma sem resultado. */
  async function seedPeriod(): Promise<{ quantitativa: string; qualitativa: string }> {
    const quantitativa = await createGoal();
    const qualitativa = await createGoal(ModalidadeAfericao.QUALITATIVA);
    await createGoal();
    await recordResult(quantitativa, { dataReferencia: '2025-03-20', valorAlcancado: 30 });
    await recordResult(quantitativa, { dataReferencia: '2025-05-10', valorAlcancado: 60 });
    await recordResult(quantitativa, { dataReferencia: '2025-06-20', valorAlcancado: 90.5 });
    await recordResult(qualitativa, {
      dataReferencia: '2025-05-05',
      alcance: AlcanceMeta.CUMPRIDA,
    });
    await createActivity('2025-05-12', 'Oficina de música — Turma A', [quantitativa, qualitativa]);
    await createActivity('2025-07-15', 'Oficina fora do período', [quantitativa]);
    return { quantitativa, qualitativa };
  }

  it('exige sessão (401), libera os perfis que consultam projetos e bloqueia os demais (403, seção 8.5.1)', async () => {
    const query = `from=${FROM}&to=${TO}&visao=CONSOLIDADA`;
    await request(app.getHttpServer())
      .get(exportPath(query))
      .set('x-test-user-id', ids[Perfil.PRESIDENCIA_GESTAO])
      .expect(401);

    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(exportPath(query)).expect(403);
    }
    for (const perfil of [
      Perfil.PRESIDENCIA_GESTAO,
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
    ]) {
      await as(perfil).get(exportPath(query)).expect(200);
    }
  });

  it('recusa projeto inexistente (404), período invertido, visão ausente e formato fora da lista (400)', async () => {
    const gestao = as(Perfil.PRESIDENCIA_GESTAO);
    await gestao.get(exportPath(`from=${FROM}&to=${TO}&visao=CONSOLIDADA`, MISSING)).expect(404);

    const invertido = await gestao
      .get(exportPath(`from=${TO}&to=${FROM}&visao=CONSOLIDADA`))
      .expect(400);
    expect((invertido.body as ErrorBody).code).toBe('INVALID_PERIOD');

    await gestao.get(exportPath(`from=${FROM}&to=${TO}`)).expect(400);
    await gestao.get(exportPath(`from=${FROM}&to=${TO}&visao=RESUMIDA`)).expect(400);
    await gestao.get(exportPath(`from=${FROM}&to=${TO}&visao=ANALITICA&formato=xlsx`)).expect(400);
    await gestao.get(exportPath(`from=2025-02-30&to=${TO}&visao=ANALITICA`)).expect(400);

    expect(await prisma.trilhaAuditoria.count({ where: { acao: 'PROJECT_DATA_EXPORTED' } })).toBe(
      0,
    );
  });

  it('CA-13.1, CA-13.2, CA-13.5: visão consolidada baixa CSV com legenda, data de corte, metas, resumo e atividades do período', async () => {
    await seedPeriod();

    const res = await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
      .get(exportPath(`from=${FROM}&to=${TO}&visao=CONSOLIDADA&formato=csv`))
      .expect(200);

    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="exportacao-P01-2025-04-01-a-2025-06-30-consolidada.csv"',
    );
    expect(res.text.startsWith('﻿')).toBe(true);

    const all = lines(res.text);
    expect(all).toContain('Projeto;P01 — Oficinas Culturais no Setor');
    expect(all).toContain('Período;01/04/2025 a 30/06/2025');
    expect(all).toContain('Visão das metas;Consolidada');
    expect(all.some((line) => /^Data de corte;\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} /.test(line))).toBe(
      true,
    );
    expect(all).toContain('Legenda');

    // Último resultado até o fim do período, com número em formato brasileiro
    const quantitativa = all.find((line) => line.startsWith('1;Edital;'));
    expect(quantitativa).toContain(';Não;20/06/2025;90,5;100;90,5;Parcialmente cumprida;');
    const qualitativa = all.find((line) => line.startsWith('2;Projeto;'));
    expect(qualitativa).toContain(';Qualitativa;;;10/01/2025;30/06/2025;');
    expect(qualitativa).toContain(';05/05/2025;;;;Cumprida;');
    const semResultado = all.find((line) => line.startsWith('3;Edital;'));
    expect(semResultado).toMatch(/;Não;;;;;;$/);

    const resumo = all.indexOf('Resumo das metas');
    expect(all.slice(resumo + 2, resumo + 8)).toEqual([
      'Metas no período;3',
      'Cumprida;1',
      'Parcialmente cumprida;1',
      'Não cumprida;0',
      'Sem resultado registrado;1',
      'Em rascunho;0',
    ]);

    expect(all).toContain(
      '12/05/2025;09:00;12:00;2,5;Oficina de música — Turma A;Oficina contínua;Galpão Cultural SCS;Ana Pedagógica;1, 2',
    );
    expect(res.text).not.toContain('Oficina fora do período');
    // CA-13.3 / RNF05: o texto livre do resultado não sai na planilha
    expect(res.text).not.toContain(FREE_TEXT);
  });

  it('CA-13.5: visão analítica traz cada resultado registrado no período, sem o anterior a ele', async () => {
    await seedPeriod();

    const res = await as(Perfil.NUCLEO_PEDAGOGICO)
      .get(exportPath(`from=${FROM}&to=${TO}&visao=ANALITICA`))
      .expect(200);
    expect(res.headers['content-disposition']).toContain('-analitica.csv"');

    const all = lines(res.text);
    expect(all).toContain('Visão das metas;Analítica');
    const quantitativa = all.filter((line) => line.startsWith('1;Edital;'));
    expect(quantitativa).toHaveLength(2);
    expect(quantitativa[0]).toContain(';10/05/2025;60;100;60;Parcialmente cumprida;');
    expect(quantitativa[1]).toContain(';20/06/2025;90,5;100;90,5;Parcialmente cumprida;');
    expect(res.text).not.toContain('20/03/2025');
    expect(all.filter((line) => line.startsWith('3;Edital;'))).toHaveLength(1);
    expect(all).not.toContain('Resumo das metas');
  });

  it('CA-13.6: período sem registro gera o arquivo com a legenda, a data de corte e a indicação', async () => {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(exportPath('from=2026-01-01&to=2026-01-31&visao=CONSOLIDADA'))
      .expect(200);

    const all = lines(res.text);
    expect(all.some((line) => line.startsWith('Data de corte;'))).toBe(true);
    expect(all).toContain('Legenda');
    expect(all.filter((line) => line === 'Sem registros no período.')).toHaveLength(2);
    expect(all).toContain('Metas no período;0');
  });

  it('CA-13.4: cada exportação fica na trilha de auditoria com autor, data e o recorte, sem texto livre', async () => {
    await seedPeriod();
    const res = await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
      .get(exportPath(`from=${FROM}&to=${TO}&visao=ANALITICA`))
      .expect(200);
    await as(Perfil.PRESIDENCIA_GESTAO)
      .get(exportPath(`from=${FROM}&to=${TO}&visao=CONSOLIDADA`))
      .expect(200);

    const trilha = await prisma.trilhaAuditoria.findMany({
      where: { acao: 'PROJECT_DATA_EXPORTED' },
      orderBy: { criadoEm: 'asc' },
    });
    expect(trilha).toHaveLength(2);
    const [primeira, segunda] = trilha;
    expect(primeira).toMatchObject({
      usuarioId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO],
      entidade: 'projeto',
      entidadeId: projetoId,
      correlationId: String(res.headers['x-correlation-id']),
    });
    expect(primeira?.criadoEm).toBeInstanceOf(Date);
    expect(primeira?.depois).toMatchObject({
      formato: 'CSV',
      visao: 'ANALITICA',
      periodoInicio: FROM,
      periodoFim: TO,
      metas: 3,
      atividades: 1,
    });
    expect(segunda?.usuarioId).toBe(ids[Perfil.PRESIDENCIA_GESTAO]);
    expect(segunda?.depois).toMatchObject({ visao: 'CONSOLIDADA' });
    expect(JSON.stringify(trilha)).not.toContain(FREE_TEXT);
  });
});
