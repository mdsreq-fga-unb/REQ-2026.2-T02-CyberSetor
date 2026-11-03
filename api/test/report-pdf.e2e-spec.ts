import { createHash } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import {
  ModalidadeAfericao,
  OrigemMeta,
  Perfil,
  TipoInstrumento,
} from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import type { OpenReportPdfResponse, ReportResponse } from '../src/reports/reports.dto.js';

const PASSWORD = 'senha longa de quem testa';
const MISSING = '00000000-0000-4000-8000-000000000000';

describe('PDF do relatório de execução (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let projetoId: string;
  let outroProjetoId: string;

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
    const projeto = (codigo: string) =>
      prisma.projeto.create({
        data: {
          instrumentoId,
          coordenadorId: ids[Perfil.PRESIDENCIA_GESTAO],
          codigo,
          titulo: 'Oficinas Culturais no Setor',
          inicio: new Date('2025-01-01T00:00:00.000Z'),
          fim: new Date('2029-12-31T00:00:00.000Z'),
        },
      });
    projetoId = (await projeto('P01')).id;
    outroProjetoId = (await projeto('P02')).id;
    const requisitoId = (
      await prisma.requisitoInstrumento.create({
        data: { instrumentoId, referencia: 'Cláusula 3.1', descricao: 'Formação cultural' },
      })
    ).id;

    const meta = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: OrigemMeta.EDITAL,
        objetivo: 'Formar jovens em oficinas artísticas',
        descricao: 'Realizar oficinas com 100 participantes',
        requisitoIds: [requisitoId],
        indicador: 'Participantes com frequência mínima de 75%',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: '100',
        unidade: 'participantes',
        periodoInicio: '2025-01-10',
        periodoFim: '2025-06-30',
        frequenciaApuracao: 'Semestral',
        formaComprovacao: 'Lista de presença',
        responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      })
      .expect(201);
    await as(Perfil.NUCLEO_PEDAGOGICO)
      .post(`/v1/goals/${(meta.body as { id: string }).id}/results`, {
        dataReferencia: '2025-06-15',
        descricao: '100 participantes com lista de presença.',
        valorAlcancado: 100,
      })
      .expect(201);
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

  async function emitir(): Promise<ReportResponse> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/reports/finalize`, { from: '2025-01-01', to: '2025-06-30' })
      .expect(201);
    return res.body as ReportResponse;
  }

  async function abrir(reportId: string, perfil: Perfil = Perfil.ADMINISTRATIVO_FINANCEIRO) {
    const res = await as(perfil)
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
    expect(res.headers['content-type']).toContain('application/pdf');
    return res.body as Buffer;
  }

  it('gera o PDF uma vez, entrega o mesmo arquivo e registra o SHA-256 no relatório e na trilha', async () => {
    const report = await emitir();
    expect(report.pdf).toBeNull();

    const link = await abrir(report.id);
    expect(link.nomeArquivo).toBe('relatorio-P01-2025-01-01-a-2025-06-30-v1.pdf');
    expect(link.sha256).toMatch(/^[0-9a-f]{64}$/);

    const arquivo = await baixar(link);
    expect(arquivo.subarray(0, 5).toString()).toBe('%PDF-');
    expect(createHash('sha256').update(arquivo).digest('hex')).toBe(link.sha256);

    const denovo = await abrir(report.id, Perfil.NUCLEO_PEDAGOGICO);
    expect(denovo).toMatchObject({ sha256: link.sha256, geradoEm: link.geradoEm });
    expect(
      createHash('sha256')
        .update(await baixar(denovo))
        .digest('hex'),
    ).toBe(link.sha256);

    const lista = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/reports`)
      .expect(200);
    expect((lista.body as ReportResponse[])[0].pdf).toEqual({
      sha256: link.sha256,
      geradoEm: link.geradoEm,
    });

    const trilha = await prisma.trilhaAuditoria.findMany({
      where: { entidadeId: report.id, acao: 'REPORT_PDF_GENERATED' },
    });
    expect(trilha).toHaveLength(1);
    expect(trilha[0]).toMatchObject({
      usuarioId: ids[Perfil.ADMINISTRATIVO_FINANCEIRO],
      depois: { versao: 1, sha256: link.sha256 },
    });
  });

  it('congela o cabeçalho na emissão: editar o projeto depois não muda o relatório (RNF08)', async () => {
    const report = await emitir();
    await prisma.projeto.update({
      where: { id: projetoId },
      data: { codigo: 'P99', titulo: 'Título editado depois' },
    });

    const link = await abrir(report.id);
    expect(link.nomeArquivo).toBe('relatorio-P01-2025-01-01-a-2025-06-30-v1.pdf');
    expect(
      await prisma.relatorio.findUniqueOrThrow({
        where: { id: report.id },
        select: { projetoCodigo: true, projetoTitulo: true, emitidoPorNome: true },
      }),
    ).toEqual({
      projetoCodigo: 'P01',
      projetoTitulo: 'Oficinas Culturais no Setor',
      emitidoPorNome: `Pessoa ${Perfil.PRESIDENCIA_GESTAO}`,
    });
  });

  it('a retificação tem PDF próprio', async () => {
    const v1 = await emitir();
    const primeiro = await abrir(v1.id);
    const v2 = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/reports/${v1.id}/rectify`, {
        motivo: 'Inclusão de comprovação consolidada depois do fechamento.',
      })
      .expect(201);

    const segundo = await abrir((v2.body as ReportResponse).id);
    expect(segundo.nomeArquivo).toBe('relatorio-P01-2025-01-01-a-2025-06-30-v2.pdf');
    expect(segundo.sha256).not.toBe(primeiro.sha256);
  });

  it('só os perfis que leem relatórios abrem o PDF, e só do próprio projeto', async () => {
    const report = await emitir();
    const path = `/v1/projects/${projetoId}/reports/${report.id}/pdf`;

    await request(app.getHttpServer()).get(path).expect(401);
    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(path).expect(403);
    }
    await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${outroProjetoId}/reports/${report.id}/pdf`)
      .expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/reports/${MISSING}/pdf`)
      .expect(404);
    expect(await prisma.relatorioPdf.count({ where: { relatorioId: report.id } })).toBe(0);
  });
});
