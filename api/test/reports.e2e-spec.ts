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
import type { ReportPendencia } from '../src/reports/report-finalization.js';
import type { ReportResponse } from '../src/reports/reports.dto.js';

const PASSWORD = 'senha longa de quem testa';
const MISSING = '00000000-0000-4000-8000-000000000000';

const NAMES: Record<Perfil, string> = {
  PRESIDENCIA_GESTAO: 'Beatriz Gestão',
  NUCLEO_PEDAGOGICO: 'Ana Pedagógica',
  ADMINISTRATIVO_FINANCEIRO: 'Carla Financeiro',
  CONCEDENTE_AUDITORIA: 'Davi Auditoria',
  ADMINISTRACAO_SISTEMA: 'Eva Administração',
};

interface ErrorBody {
  code: string;
  message: string;
  correlationId: string;
  details: {
    errors?: string[];
    pendencias?: ReportPendencia[];
  };
}

describe('Emissão, bloqueio e retificação de relatórios de execução (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;
  let projetoId: string;
  let requisitoId: string;

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
      'TRUNCATE TABLE trilha_auditoria, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );

    instrumentoId = (
      await prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.PARCERIA,
          orgaoConcedente: 'Secretaria de Cultura e Economia Criativa do DF',
          numeroProcesso: '00150-00009999/2025-01',
          valorGlobal: '250000.00',
          dataCelebracao: new Date('2024-12-10T00:00:00.000Z'),
          vigenciaInicio: new Date('2025-01-01T00:00:00.000Z'),
          vigenciaFim: new Date('2027-12-31T00:00:00.000Z'),
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
          fim: new Date('2026-12-31T00:00:00.000Z'),
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

  async function createQuantitativeGoal(
    overrides: Partial<{
      objetivo: string;
      descricao: string;
      parametroPlanejado: string;
      unidade: string;
      periodoInicio: string;
      periodoFim: string;
    }> = {},
  ): Promise<{ id: string; versao: number }> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: OrigemMeta.EDITAL,
        objetivo: overrides.objetivo ?? 'Formar jovens em oficinas artísticas',
        descricao: overrides.descricao ?? 'Realizar oficinas com 100 participantes',
        requisitoIds: [requisitoId],
        indicador: 'Participantes com frequência mínima de 75%',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: overrides.parametroPlanejado ?? '100',
        unidade: overrides.unidade ?? 'participantes',
        periodoInicio: overrides.periodoInicio ?? '2025-01-10',
        periodoFim: overrides.periodoFim ?? '2025-06-30',
        frequenciaApuracao: 'Semestral',
        formaComprovacao: 'Lista de presença e registro fotográfico',
        responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      })
      .expect(201);
    return res.body as { id: string; versao: number };
  }

  async function createQualitativeGoal(descricao = 'Realizar mostra aberta à comunidade') {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: OrigemMeta.PROJETO,
        objetivo: 'Promover difusão cultural comunitária',
        descricao,
        requisitoIds: [requisitoId],
        indicador: 'Mostra realizada com registro audiovisual',
        modalidadeAfericao: ModalidadeAfericao.QUALITATIVA,
        periodoInicio: '2025-01-10',
        periodoFim: '2025-06-30',
        frequenciaApuracao: 'Semestral',
        formaComprovacao: 'Vídeo e ata do evento',
        responsavelId: ids[Perfil.NUCLEO_PEDAGOGICO],
      })
      .expect(201);
    return res.body as { id: string; versao: number };
  }

  async function createDraftGoal(): Promise<{ id: string }> {
    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/goals`, {
        origem: OrigemMeta.INSTITUTO,
        objetivo: 'Meta interna ainda em elaboração',
        descricao: 'Sistematizar memória pedagógica das oficinas',
        requisitoIds: [requisitoId],
      })
      .expect(201);
    return res.body as { id: string };
  }

  async function recordResult(
    goalId: string,
    payload: {
      dataReferencia: string;
      descricao: string;
      valorAlcancado?: number;
      alcance?: AlcanceMeta;
    },
    perfil: Perfil = Perfil.NUCLEO_PEDAGOGICO,
  ) {
    return as(perfil).post(`/v1/goals/${goalId}/results`, payload).expect(201);
  }

  it('exige autenticação (401), respeita perfis da matriz 8.5.1 (403) e ignora cabeçalho x-test-user-id', async () => {
    const meta = await createQuantitativeGoal();
    await recordResult(meta.id, {
      dataReferencia: '2025-06-15',
      descricao: '100 participantes certificados.',
      valorAlcancado: 100,
    });

    const finalizePath = `/v1/projects/${projetoId}/report/finalize`;
    const listPath = `/v1/projects/${projetoId}/reports`;

    // Sem sessão: 401 mesmo enviando x-test-user-id
    await request(app.getHttpServer())
      .post(finalizePath)
      .set('x-test-user-id', ids[Perfil.PRESIDENCIA_GESTAO])
      .send({ from: '2025-01-01', to: '2025-06-30' })
      .expect(401);
    await request(app.getHttpServer())
      .get(listPath)
      .set('x-test-user-id', ids[Perfil.PRESIDENCIA_GESTAO])
      .expect(401);

    // Perfis que não emitem relatório recebem 403
    for (const perfil of [
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.CONCEDENTE_AUDITORIA,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await as(perfil).post(finalizePath, { from: '2025-01-01', to: '2025-06-30' }).expect(403);
    }

    // Presidência emite; mesmo enviando x-test-user-id de outra pessoa, sai em nome da sessão autenticada
    const emitted = await request(app.getHttpServer())
      .post(finalizePath)
      .set('Authorization', `Bearer ${tokens[Perfil.PRESIDENCIA_GESTAO]}`)
      .set('x-test-user-id', ids[Perfil.NUCLEO_PEDAGOGICO])
      .send({ from: '2025-01-01', to: '2025-06-30' })
      .expect(201);

    const report = emitted.body as ReportResponse;
    expect(report.emitidoPor).toEqual({
      id: ids[Perfil.PRESIDENCIA_GESTAO],
      nome: NAMES[Perfil.PRESIDENCIA_GESTAO],
    });
    expect(Object.keys(report.emitidoPor).sort()).toEqual(['id', 'nome']);

    // Perfis sem permissão de retificação recebem 403
    const rectifyPath = `/v1/projects/${projetoId}/report/${report.id}/rectify`;
    for (const perfil of [
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.CONCEDENTE_AUDITORIA,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await as(perfil).post(rectifyPath, { motivo: 'Tentativa indevida' }).expect(403);
    }
    await request(app.getHttpServer()).post(rectifyPath).send({ motivo: 'Sem login' }).expect(401);

    // Leitura do histórico: permitida aos leitores de instrumento, negada aos demais, sem vazar dados sensíveis
    for (const perfil of [
      Perfil.PRESIDENCIA_GESTAO,
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
    ]) {
      const listRes = await as(perfil).get(listPath).expect(200);
      const items = listRes.body as ReportResponse[];
      expect(items).toHaveLength(1);
      expect(items[0]?.emitidoPor).toEqual({
        id: ids[Perfil.PRESIDENCIA_GESTAO],
        nome: NAMES[Perfil.PRESIDENCIA_GESTAO],
      });
      const rawIssuer = items[0]?.emitidoPor as unknown as Record<string, unknown>;
      expect(rawIssuer.senhaHash).toBeUndefined();
      expect(rawIssuer.emailLogin).toBeUndefined();
      expect(rawIssuer.falhasLogin).toBeUndefined();
      expect(rawIssuer.bloqueadoAte).toBeUndefined();
    }

    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      await as(perfil).get(listPath).expect(403);
    }
  });

  it('usa o correlationId validado pelo middleware na trilha de auditoria', async () => {
    const meta = await createQuantitativeGoal();
    await recordResult(meta.id, {
      dataReferencia: '2025-06-15',
      descricao: '100 participantes certificados.',
      valorAlcancado: 100,
    });

    const invalidLongHeader = 'x'.repeat(10_000);
    const res = await request(app.getHttpServer())
      .post(`/v1/projects/${projetoId}/report/finalize`)
      .set('Authorization', `Bearer ${tokens[Perfil.PRESIDENCIA_GESTAO]}`)
      .set('x-correlation-id', invalidLongHeader)
      .send({ from: '2025-01-01', to: '2025-06-30' })
      .expect(201);

    const responseCorrelationId = String(res.headers['x-correlation-id'] ?? '');
    expect(responseCorrelationId.length).toBeGreaterThan(0);
    expect(responseCorrelationId.length).toBeLessThanOrEqual(128);
    expect(responseCorrelationId).not.toBe(invalidLongHeader);

    const report = res.body as ReportResponse;
    const audit = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidade: 'relatorio', entidadeId: report.id, acao: 'REPORT_FINALIZED' },
    });
    expect(audit.correlationId).toBe(responseCorrelationId);
    expect(audit.usuarioId).toBe(ids[Perfil.PRESIDENCIA_GESTAO]);
  });

  it('CA-05a.7: bloqueia finalização (422) quando há meta ativa sem resultado registrado no período', async () => {
    const meta = await createQuantitativeGoal();

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
      })
      .expect(422);

    const err = res.body as ErrorBody;
    expect(err.code).toBe('REPORT_FINALIZATION_BLOCKED');
    expect(err.details.pendencias).toEqual([
      {
        metaId: meta.id,
        ordem: 1,
        descricao: 'Realizar oficinas com 100 participantes',
        motivo: 'SEM_RESULTADO_REGISTRADO',
        alcance: null,
        percentual: null,
      },
    ]);
    expect(await prisma.relatorio.count()).toBe(0);
  });

  it('CA-05a.2 (#132): bloqueia finalização (422) sem justificativa e aprova após preenchimento', async () => {
    const metaQuant = await createQuantitativeGoal();
    const metaQual = await createQualitativeGoal();

    await recordResult(metaQuant.id, {
      dataReferencia: '2025-06-15',
      descricao: '80 jovens concluíram as oficinas.',
      valorAlcancado: 80,
    });
    await recordResult(metaQual.id, {
      dataReferencia: '2025-06-20',
      descricao: 'Evento cancelado por fortes chuvas.',
      alcance: AlcanceMeta.NAO_CUMPRIDA,
    });

    const bloqueado = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
      })
      .expect(422);

    const err = bloqueado.body as ErrorBody;
    expect(err.code).toBe('REPORT_FINALIZATION_BLOCKED');
    expect(err.details.pendencias).toEqual([
      {
        metaId: metaQuant.id,
        ordem: 1,
        descricao: 'Realizar oficinas com 100 participantes',
        motivo: 'SEM_JUSTIFICATIVA',
        alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
        percentual: 80,
      },
      {
        metaId: metaQual.id,
        ordem: 2,
        descricao: 'Realizar mostra aberta à comunidade',
        motivo: 'SEM_JUSTIFICATIVA',
        alcance: AlcanceMeta.NAO_CUMPRIDA,
        percentual: null,
      },
    ]);

    const emitido = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [
          { metaId: metaQuant.id, texto: '  Evasão pontual por mudança de turno escolar.  ' },
          { metaId: metaQual.id, texto: 'Reagendada para o semestre seguinte após alagamento.' },
        ],
      })
      .expect(201);

    const body = emitido.body as ReportResponse;
    expect(body.versao).toBe(1);
    expect(body.metas).toHaveLength(2);
    expect(body.metas[0]).toMatchObject({
      metaId: metaQuant.id,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
      percentual: 80,
      justificativa: 'Evasão pontual por mudança de turno escolar.',
    });
    expect(body.metas[1]).toMatchObject({
      metaId: metaQual.id,
      alcance: AlcanceMeta.NAO_CUMPRIDA,
      percentual: null,
      justificativa: 'Reagendada para o semestre seguinte após alagamento.',
    });
  });

  it('RN-02: meta em rascunho sem resultado não trava a finalização nem entra na cópia emitida', async () => {
    const ativa = await createQuantitativeGoal();
    await createDraftGoal();

    await recordResult(ativa.id, {
      dataReferencia: '2025-06-10',
      descricao: '105 participantes certificados.',
      valorAlcancado: 105,
    });

    const res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
      })
      .expect(201);

    const report = res.body as ReportResponse;
    expect(report.metas).toHaveLength(1);
    expect(report.metas[0]?.metaId).toBe(ativa.id);
  });

  it('recusa datas fora do formato AAAA-MM-DD, período invertido e justificativas inválidas', async () => {
    const cumprida = await createQuantitativeGoal();
    const rascunho = await createDraftGoal();
    await recordResult(cumprida.id, {
      dataReferencia: '2025-06-10',
      descricao: 'Meta integralmente atingida.',
      valorAlcancado: 100,
    });

    const finalizePath = `/v1/projects/${projetoId}/report/finalize`;

    // ISO timestamp não é aceito (exige AAAA-MM-DD estrito)
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, { from: '2025-01-01T10:00:00Z', to: '2025-06-30' })
      .expect(400);

    // Data inexistente no calendário
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, { from: '2025-02-30', to: '2025-06-30' })
      .expect(400);

    // Período invertido
    const invertido = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, { from: '2025-06-30', to: '2025-01-01' })
      .expect(400);
    expect((invertido.body as ErrorBody).code).toBe('INVALID_PERIOD');

    // Justificativa para meta de outro projeto / inexistente
    const estranha = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: MISSING, texto: 'Meta inexistente' }],
      })
      .expect(400);
    expect((estranha.body as ErrorBody).code).toBe('INVALID_REPORT_GOAL');

    // Justificativa para meta em rascunho
    const emRascunho = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: rascunho.id, texto: 'Meta em rascunho' }],
      })
      .expect(400);
    expect((emRascunho.body as ErrorBody).code).toBe('INVALID_REPORT_GOAL');

    // Justificativa para meta cumprida
    const desnecessaria = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: cumprida.id, texto: 'Não deveria ter justificativa' }],
      })
      .expect(400);
    expect((desnecessaria.body as ErrorBody).code).toBe('JUSTIFICATION_NOT_APPLICABLE');

    // Justificativa acima de 2000 caracteres ou vazia
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: cumprida.id, texto: 'a'.repeat(2001) }],
      })
      .expect(400);
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: cumprida.id, texto: '   ' }],
      })
      .expect(400);

    // Projeto inexistente e instrumento inativo
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${MISSING}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
      })
      .expect(404);
    await as(Perfil.PRESIDENCIA_GESTAO).get(`/v1/projects/${MISSING}/reports`).expect(404);

    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });
    const inativo = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(finalizePath, { from: '2025-01-01', to: '2025-06-30' })
      .expect(409);
    expect((inativo.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
  });

  it('congela planejado do resultado e textos da meta na cópia emitida mesmo se a meta mudar depois', async () => {
    const meta = await createQuantitativeGoal({
      objetivo: 'Objetivo original do 1º semestre',
      descricao: 'Descrição original da meta',
      parametroPlanejado: '100',
      unidade: 'oficinas',
    });

    await recordResult(meta.id, {
      dataReferencia: '2025-06-15',
      descricao: '80 oficinas comprovadas com lista de presença.',
      valorAlcancado: 80,
    });

    // Altera o parâmetro planejado da meta ANTES de emitir o relatório:
    // a cópia deve usar o planejado congelado no resultado (100), batendo com 80%.
    const alteradaAntes = await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/goals/${meta.id}`, {
        versao: meta.versao,
        parametroPlanejado: '200',
      })
      .expect(200);

    const emitido = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: meta.id, texto: 'Redução de calendário por reforma.' }],
      })
      .expect(201);

    expect((emitido.body as ReportResponse).metas[0]).toMatchObject({
      parametroPlanejado: 100,
      valorAlcancado: 80,
      percentual: 80,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
    });

    // Altera textos da meta DEPOIS da emissão: relatório já emitido permanece intacto
    await as(Perfil.PRESIDENCIA_GESTAO)
      .patch(`/v1/goals/${meta.id}`, {
        versao: (alteradaAntes.body as { versao: number }).versao,
        objetivo: 'Objetivo repactuado no 2º semestre',
        descricao: 'Nova descrição repactuada',
        indicador: 'Novo indicador',
        unidade: 'turmas',
      })
      .expect(200);

    const historico = await as(Perfil.PRESIDENCIA_GESTAO)
      .get(`/v1/projects/${projetoId}/reports`)
      .expect(200);
    const item = (historico.body as ReportResponse[])[0]?.metas[0];
    expect(item).toMatchObject({
      metaOrigem: OrigemMeta.EDITAL,
      metaObjetivo: 'Objetivo original do 1º semestre',
      metaDescricao: 'Descrição original da meta',
      metaIndicador: 'Participantes com frequência mínima de 75%',
      unidade: 'oficinas',
      parametroPlanejado: 100,
      valorAlcancado: 80,
      percentual: 80,
      resultadoDataReferencia: '2025-06-15',
      resultadoDescricao: '80 oficinas comprovadas com lista de presença.',
      justificativa: 'Redução de calendário por reforma.',
    });
  });

  it('versiona cada período de forma independente e recusa dupla finalização do mesmo período (409)', async () => {
    const meta = await createQuantitativeGoal({
      periodoInicio: '2025-01-10',
      periodoFim: '2025-12-20',
    });

    await recordResult(meta.id, {
      dataReferencia: '2025-06-15',
      descricao: '60 participantes no 1º semestre.',
      valorAlcancado: 60,
    });

    const sem1 = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [
          { metaId: meta.id, texto: 'Execução parcial prevista para o 1º semestre.' },
        ],
      })
      .expect(201);
    expect((sem1.body as ReportResponse).versao).toBe(1);

    // Tentar finalizar novamente o mesmo período retorna 409 REPORT_ALREADY_FINALIZED
    const duplicado = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: meta.id, texto: 'Tentativa duplicada' }],
      })
      .expect(409);
    expect((duplicado.body as ErrorBody).code).toBe('REPORT_ALREADY_FINALIZED');

    // 2º semestre inicia sua própria versão 1
    await recordResult(meta.id, {
      dataReferencia: '2025-12-10',
      descricao: '100 participantes acumulados até dezembro.',
      valorAlcancado: 100,
    });

    const sem2 = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-07-01',
        to: '2025-12-31',
      })
      .expect(201);
    expect((sem2.body as ReportResponse).versao).toBe(1);
    expect((sem2.body as ReportResponse).metas[0]).toMatchObject({
      valorAlcancado: 100,
      percentual: 100,
      alcance: AlcanceMeta.CUMPRIDA,
      justificativa: null,
    });
  });

  it('CA-05a.3 / RNF08 (#134): retifica gerando nova versão linear, grava auditoria e preserva v1 intocada', async () => {
    const meta = await createQuantitativeGoal();
    await recordResult(meta.id, {
      dataReferencia: '2025-06-15',
      descricao: '75 participantes apurados inicialmente.',
      valorAlcancado: 75,
    });

    const v1Res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/finalize`, {
        from: '2025-01-01',
        to: '2025-06-30',
        justificativas: [{ metaId: meta.id, texto: 'Justificativa original da v1.' }],
      })
      .expect(201);
    const v1 = v1Res.body as ReportResponse;

    const v1SnapshotAntes = await prisma.relatorio.findUniqueOrThrow({
      where: { id: v1.id },
      include: { metas: true },
    });

    // Novo resultado apurado ainda dentro do período após fechamento da v1
    await recordResult(meta.id, {
      dataReferencia: '2025-06-28',
      descricao: '90 participantes após conferência de listas físicas.',
      valorAlcancado: 90,
    });

    const v2Res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/${v1.id}/rectify`, {
        motivo: '  Conferência de listas físicas de presença da última oficina.  ',
        justificativas: [
          { metaId: meta.id, texto: 'Justificativa consolidada na v2 após conferência.' },
        ],
      })
      .expect(201);
    const v2 = v2Res.body as ReportResponse;

    expect(v2).toMatchObject({
      projetoId,
      versao: 2,
      periodoInicio: '2025-01-01',
      periodoFim: '2025-06-30',
      relatorioAnteriorId: v1.id,
      motivoRetificacao: 'Conferência de listas físicas de presença da última oficina.',
    });
    expect(v2.metas[0]).toMatchObject({
      valorAlcancado: 90,
      percentual: 90,
      alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
      justificativa: 'Justificativa consolidada na v2 após conferência.',
    });

    // RNF08: 0 alterações diretas no registro da v1 e de suas metas no banco
    const v1SnapshotDepois = await prisma.relatorio.findUniqueOrThrow({
      where: { id: v1.id },
      include: { metas: true },
    });
    expect(v1SnapshotDepois).toEqual(v1SnapshotAntes);

    // Trilha de auditoria permanente com REPORT_RECTIFIED
    const audit = await prisma.trilhaAuditoria.findFirstOrThrow({
      where: { entidade: 'relatorio', entidadeId: v2.id, acao: 'REPORT_RECTIFIED' },
    });
    expect(audit.usuarioId).toBe(ids[Perfil.PRESIDENCIA_GESTAO]);
    expect(audit.antes).toEqual({ relatorioId: v1.id, versao: 1 });
    expect(audit.depois).toMatchObject({
      relatorioId: v2.id,
      versao: 2,
      periodoInicio: '2025-01-01',
      periodoFim: '2025-06-30',
      motivoRetificacao: 'Conferência de listas físicas de presença da última oficina.',
    });

    // Tentar retificar novamente a v1 (já superada pela v2) retorna 409 REPORT_NOT_LATEST_VERSION
    const obsoleta = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/${v1.id}/rectify`, {
        motivo: 'Tentativa de bifurcar histórico a partir da v1',
      })
      .expect(409);
    expect((obsoleta.body as ErrorBody).code).toBe('REPORT_NOT_LATEST_VERSION');

    // Retificar a v2 gera a v3 mantendo a justificativa herdada da v2 quando não sobrescrita
    const v3Res = await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/${v2.id}/rectify`, {
        motivo: 'Ajuste formal de despacho sem alterar justificativa.',
      })
      .expect(201);
    const v3 = v3Res.body as ReportResponse;
    expect(v3.versao).toBe(3);
    expect(v3.relatorioAnteriorId).toBe(v2.id);
    expect(v3.metas[0]?.justificativa).toBe('Justificativa consolidada na v2 após conferência.');

    // Relatório inexistente retorna 404
    await as(Perfil.PRESIDENCIA_GESTAO)
      .post(`/v1/projects/${projetoId}/report/${MISSING}/rectify`, {
        motivo: 'Relatório inexistente',
      })
      .expect(404);
  });
});
