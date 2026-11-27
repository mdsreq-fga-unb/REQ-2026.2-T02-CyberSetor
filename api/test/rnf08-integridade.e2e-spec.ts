import { createHash } from 'node:crypto';
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
import { buildReportDocument, type ReportForPdf } from '../src/reports/pdf/report-document.js';
import { ReportPdfRenderer } from '../src/reports/pdf/report-pdf.renderer.js';
import type { OpenReportPdfResponse, ReportResponse } from '../src/reports/reports.dto.js';
import { isoDate, toGoalItemResponse } from '../src/reports/reports.service.js';

/**
 * RNF08 — integridade de relatórios fechados (#336).
 *
 * Métrica (seção 8.3): 100% de correspondência entre o hash do arquivo e o registro na base;
 * 0 alterações diretas no ciclo fechado; 100% de igualdade entre o relatório e uma massa com
 * resultados conhecidos (por meta: pactuado, alcançado, percentual e justificativa); relatório
 * de versão fechada reemitido idêntico depois de novos registros no período.
 */

const PASSWORD = 'senha longa de quem testa';
const FROM = '2025-01-01';
const TO = '2025-06-30';

interface Caso {
  descricao: string;
  modalidade: ModalidadeAfericao;
  planejado: string | null;
  unidade: string | null;
  alcancado: number | null;
  alcanceInformado?: AlcanceMeta;
  justificativa: string | null;
  esperado: {
    parametroPlanejado: number | null;
    valorAlcancado: number | null;
    percentual: number | null;
    alcance: AlcanceMeta;
  };
}

// Massa com resultados conhecidos: cada linha cobre uma regra da RN-14 (percentual sobre o
// planejado, sem teto, com duas casas; alcance pelo percentual; qualitativa informada).
const MASSA: Caso[] = [
  {
    descricao: 'Cumprida no planejado',
    modalidade: ModalidadeAfericao.QUANTITATIVA,
    planejado: '100',
    unidade: 'participantes',
    alcancado: 100,
    justificativa: null,
    esperado: {
      parametroPlanejado: 100,
      valorAlcancado: 100,
      percentual: 100,
      alcance: AlcanceMeta.CUMPRIDA,
    },
  },
  {
    descricao: 'Acima do planejado, sem teto de 100%',
    modalidade: ModalidadeAfericao.QUANTITATIVA,
    planejado: '100',
    unidade: 'participantes',
    alcancado: 125,
    justificativa: null,
    esperado: {
      parametroPlanejado: 100,
      valorAlcancado: 125,
      percentual: 125,
      alcance: AlcanceMeta.CUMPRIDA,
    },
  },
  {
    descricao: 'Parcial com dízima, arredondada em duas casas',
    modalidade: ModalidadeAfericao.QUANTITATIVA,
    planejado: '3',
    unidade: 'turmas',
    alcancado: 2,
    justificativa: 'Uma turma cancelada por falta de espaço.',
    esperado: {
      parametroPlanejado: 3,
      valorAlcancado: 2,
      percentual: 66.67,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    },
  },
  {
    descricao: 'Parcial com planejado decimal',
    modalidade: ModalidadeAfericao.QUANTITATIVA,
    planejado: '12,5',
    unidade: 'horas',
    alcancado: 10,
    justificativa: 'Duas aulas remarcadas para o semestre seguinte.',
    esperado: {
      parametroPlanejado: 12.5,
      valorAlcancado: 10,
      percentual: 80,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    },
  },
  {
    descricao: 'Não cumprida',
    modalidade: ModalidadeAfericao.QUANTITATIVA,
    planejado: '40',
    unidade: 'apresentações',
    alcancado: 0,
    justificativa: 'Teatro interditado durante todo o período.',
    esperado: {
      parametroPlanejado: 40,
      valorAlcancado: 0,
      percentual: 0,
      alcance: AlcanceMeta.NAO_CUMPRIDA,
    },
  },
  {
    descricao: 'Qualitativa parcialmente cumprida',
    modalidade: ModalidadeAfericao.QUALITATIVA,
    planejado: null,
    unidade: null,
    alcancado: null,
    alcanceInformado: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    justificativa: 'Mostra final adiada pela chuva.',
    esperado: {
      parametroPlanejado: null,
      valorAlcancado: null,
      percentual: null,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    },
  },
];

describe('RNF08 — integridade de relatórios fechados (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let projetoId: string;
  let metaIds: string[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
    const senhaHash = await passwords.hash(PASSWORD);
    for (const perfil of Object.values(Perfil)) {
      const emailLogin = `${perfil.toLowerCase()}@instituto.test`;
      const pessoa = await prisma.pessoa.create({ data: { nome: `Pessoa ${perfil}` } });
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
      'TRUNCATE TABLE trilha_auditoria, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
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

    const requisitoId = (
      await prisma.requisitoInstrumento.create({
        data: { instrumentoId, referencia: 'Cláusula 3.1', descricao: 'Formação cultural' },
      })
    ).id;

    metaIds = [];
    for (const caso of MASSA) {
      const meta = await as(Perfil.PRESIDENCIA_GESTAO)
        .post(`/v1/projects/${projetoId}/goals`, {
          origem: OrigemMeta.EDITAL,
          objetivo: caso.descricao,
          descricao: `Meta da massa do RNF08: ${caso.descricao}`,
          requisitoIds: [requisitoId],
          indicador: 'Indicador da massa de referência',
          modalidadeAfericao: caso.modalidade,
          parametroPlanejado: caso.planejado,
          unidade: caso.unidade,
          periodoInicio: '2025-01-10',
          periodoFim: TO,
          frequenciaApuracao: 'Semestral',
          formaComprovacao: 'Lista de presença',
          responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
        })
        .expect(201);
      const metaId = (meta.body as { id: string }).id;
      metaIds.push(metaId);
      await registrar(metaId, caso, '2025-06-15');
    }
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

  async function registrar(
    metaId: string,
    caso: Pick<Caso, 'alcancado' | 'alcanceInformado'>,
    dataReferencia: string,
  ) {
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(`/v1/goals/${metaId}/results`, {
        dataReferencia,
        descricao: `Resultado registrado em ${dataReferencia}.`,
        ...(caso.alcancado === null
          ? { alcance: caso.alcanceInformado }
          : { valorAlcancado: caso.alcancado }),
      })
      .expect(201);
  }

  function emissao() {
    return as(Perfil.PRESIDENCIA_GESTAO).post(`/v1/projects/${projetoId}/reports/finalize`, {
      from: FROM,
      to: TO,
      justificativas: MASSA.flatMap((caso, i) =>
        caso.justificativa ? [{ metaId: metaIds[i], texto: caso.justificativa }] : [],
      ),
    });
  }

  async function emitir(): Promise<ReportResponse> {
    const res = await emissao().expect(201);
    return res.body as ReportResponse;
  }

  async function abrir(reportId: string): Promise<OpenReportPdfResponse> {
    const res = await as(Perfil.ADMINISTRATIVO_FINANCEIRO)
      .get(`/v1/projects/${projetoId}/reports/${reportId}/pdf`)
      .expect(200);
    return res.body as OpenReportPdfResponse;
  }

  async function baixar(link: OpenReportPdfResponse): Promise<Buffer> {
    const res = await request(app.getHttpServer())
      .get(new URL(link.url).pathname)
      .buffer(true)
      .parse((response, done) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    return res.body as Buffer;
  }

  const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

  function congelado(reportId: string) {
    return prisma.relatorio.findUniqueOrThrow({
      where: { id: reportId },
      include: { metas: { orderBy: { metaOrdem: 'asc' } } },
    });
  }

  async function listar(): Promise<ReportResponse[]> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/reports`)
      .expect(200);
    return res.body as ReportResponse[];
  }

  /** Novos resultados no mesmo período, que mudariam um relatório emitido agora. */
  async function novosRegistrosNoPeriodo() {
    await registrar(metaIds[2], { alcancado: 3 }, '2025-06-28');
    await registrar(metaIds[4], { alcancado: 40 }, '2025-06-29');
  }

  it('o relatório emitido é igual, meta a meta, à massa com resultados conhecidos', async () => {
    const report = await emitir();

    expect(report.metas).toHaveLength(MASSA.length);
    report.metas.forEach((item, i) => {
      expect(item, MASSA[i].descricao).toMatchObject({
        metaId: metaIds[i],
        metaOrdem: i + 1,
        unidade: MASSA[i].unidade,
        justificativa: MASSA[i].justificativa,
        ...MASSA[i].esperado,
      });
    });

    // O que fica gravado na base é o mesmo que a API devolveu na emissão.
    expect((await listar())[0].metas).toEqual(report.metas);
  });

  it('o hash do arquivo corresponde ao registrado, e a reemissão depois de novos registros no período é idêntica', async () => {
    const report = await emitir();
    const antes = await congelado(report.id);
    const link = await abrir(report.id);
    const arquivo = await baixar(link);
    expect(sha256(arquivo)).toBe(link.sha256);

    await novosRegistrosNoPeriodo();

    // Os novos resultados existem: a prévia do mesmo período já sairia diferente da v1.
    const previa = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/report-preview?from=${FROM}&to=${TO}`)
      .expect(200);
    const percentuais = (previa.body as { metas: { id: string; percentual: number | null }[] })
      .metas;
    expect(percentuais.find((meta) => meta.id === metaIds[2])?.percentual).toBe(100);
    expect(percentuais.find((meta) => meta.id === metaIds[4])?.percentual).toBe(100);
    expect(report.metas[2].percentual).toBe(66.67);
    expect(report.metas[4].percentual).toBe(0);

    // A versão fechada não muda: nem o registro, nem a resposta da API, nem o arquivo.
    expect(await congelado(report.id)).toEqual(antes);
    expect((await listar())[0].metas).toEqual(report.metas);
    const reemitido = await abrir(report.id);
    expect(reemitido).toMatchObject({ sha256: link.sha256, geradoEm: link.geradoEm });
    expect(sha256(await baixar(reemitido))).toBe(link.sha256);
  });

  it('o PDF gerado só depois de novos registros no período reproduz a versão fechada', async () => {
    const report = await emitir();
    const row = await congelado(report.id);
    // O PDF esperado, montado a partir do registro congelado na emissão.
    const esperado: ReportForPdf = {
      versao: row.versao,
      versaoAnterior: null,
      motivoRetificacao: row.motivoRetificacao,
      periodoInicio: isoDate(row.periodoInicio),
      periodoFim: isoDate(row.periodoFim),
      criadoEm: row.criadoEm,
      emitidoPorNome: row.emitidoPorNome,
      projetoCodigo: row.projetoCodigo,
      projetoTitulo: row.projetoTitulo,
      instrumentoTipo: row.instrumentoTipo,
      orgaoConcedente: row.orgaoConcedente,
      numeroProcesso: row.numeroProcesso,
      metas: row.metas.map(toGoalItemResponse),
    };
    const pdfEsperado = await app.get(ReportPdfRenderer).render(buildReportDocument(esperado));

    await novosRegistrosNoPeriodo();

    // Primeira abertura do PDF, depois dos novos registros: sai o da versão fechada.
    const link = await abrir(report.id);
    expect(link.sha256).toBe(pdfEsperado.sha256);
    expect(sha256(await baixar(link))).toBe(pdfEsperado.sha256);
  });

  it('não há alteração direta do relatório fechado pela API', async () => {
    const report = await emitir();
    const antes = await congelado(report.id);
    const server = request(app.getHttpServer());
    const auth = `Bearer ${tokens[Perfil.PRESIDENCIA_GESTAO]}`;
    const caminho = `/v1/projects/${projetoId}/reports/${report.id}`;

    for (const metodo of ['put', 'patch', 'delete'] as const) {
      await server[metodo](caminho).set('Authorization', auth).send({}).expect(404);
    }
    // Uma segunda emissão do mesmo período é recusada; a mudança só entra por retificação (v2).
    await emissao().expect(409);

    expect(await congelado(report.id)).toEqual(antes);
  });
});
