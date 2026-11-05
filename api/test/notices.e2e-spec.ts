import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PasswordService } from '../src/accounts/password.service.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { EMAIL_SENDER, EmailDeliveryError, type EmailMessage } from '../src/email/email-sender.js';
import {
  OrigemMeta,
  Perfil,
  SituacaoAvisoEmail,
  SituacaoMeta,
  TipoInstrumento,
} from '../src/generated/prisma/enums.js';
import { NoticesService } from '../src/notices/notices.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

vi.hoisted(() => {
  process.env.APP_WEB_URL = 'https://app.test/';
});

const PASSWORD = 'senha longa de quem testa';
const DAY = 24 * 60 * 60 * 1000;
const COORDENADORA = 'coordenadora@instituto.test';
const RESPONSAVEL = 'nucleo_pedagogico@instituto.test';
const SEGUNDA_GESTAO = 'gestao2@instituto.test';

function brasilia(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(Date.now() + offsetDays * DAY),
  );
}

function day(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

describe('Avisos de meta por e-mail (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let notices: NoticesService;
  const accepts = vi.fn<(email: string) => boolean>();
  const send = vi.fn<(message: EmailMessage) => Promise<{ messageId: string }>>();
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<string, string>;
  let instrumentoId: string;
  let projetoId: string;
  let ordem = 0;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_SENDER)
      .useValue({ accepts, send })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    notices = app.get(NoticesService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE aviso_email, aviso_meta, trilha_auditoria, sessao, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );

    const senhaHash = await passwords.hash(PASSWORD);
    const accounts: [string, Perfil][] = [
      [COORDENADORA, Perfil.PRESIDENCIA_GESTAO],
      [SEGUNDA_GESTAO, Perfil.PRESIDENCIA_GESTAO],
      [RESPONSAVEL, Perfil.NUCLEO_PEDAGOGICO],
    ];
    for (const [emailLogin, perfil] of accounts) {
      const pessoa = await prisma.pessoa.create({ data: { nome: emailLogin } });
      const usuario = await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      ids[emailLogin] = usuario.id;
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      if (emailLogin !== SEGUNDA_GESTAO) {
        tokens[perfil] = (res.body as { accessToken: string }).accessToken;
      }
    }
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE aviso_email, aviso_meta, trilha_auditoria, relatorio_meta, relatorio, resultado_meta, meta_requisito, meta, projeto, requisito_instrumento, instrumento RESTART IDENTITY CASCADE',
    );
    accepts.mockReset().mockReturnValue(true);
    send.mockReset().mockResolvedValue({ messageId: '<id@relay>' });
    ordem = 0;

    instrumentoId = (
      await prisma.instrumento.create({
        data: {
          tipo: TipoInstrumento.PARCERIA,
          orgaoConcedente: 'Secretaria de Cultura',
          numeroProcesso: '00150-00009999/2025-01',
          valorGlobal: '250000.00',
          dataCelebracao: day('2024-12-10'),
          vigenciaInicio: day('2025-01-01'),
          vigenciaFim: day('2030-12-31'),
        },
      })
    ).id;
    projetoId = (
      await prisma.projeto.create({
        data: {
          instrumentoId,
          coordenadorId: ids[COORDENADORA],
          codigo: 'P01',
          titulo: 'Oficinas Culturais',
          inicio: day('2025-01-01'),
          fim: day('2030-12-31'),
        },
      })
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  function goal(periodoFim: string | null, responsavelId: string | null = ids[RESPONSAVEL]) {
    ordem += 1;
    return prisma.meta.create({
      data: {
        projetoId,
        ordem,
        origem: OrigemMeta.INSTITUTO,
        objetivo: `Objetivo ${ordem}`,
        descricao: 'Descrição',
        periodoFim: periodoFim ? day(periodoFim) : null,
        responsavelId,
      },
    });
  }

  function destinatarios(): string[] {
    return send.mock.calls.map(([message]) => message.to).sort();
  }

  function registros() {
    return prisma.avisoEmail.findMany({ orderBy: { criadoEm: 'asc' } });
  }

  it('CA-02b.4: avisa o responsável e a coordenação uma vez, até 30 dias antes do prazo', async () => {
    await goal(brasilia(30));

    await notices.runDaily();
    await notices.runDaily();

    expect(destinatarios()).toEqual([COORDENADORA, RESPONSAVEL].sort());
    const [primeiro] = send.mock.calls[0];
    expect(primeiro.subject).toBe('1 aviso de meta');
    expect(primeiro.tag).toBe('RESUMO_METAS');
    expect(primeiro.html).toContain('Vencem em até 30 dias');
    expect(primeiro.html).not.toContain('Objetivo');
    expect(primeiro.html).toContain(
      `https://app.test/instrumentos/${instrumentoId}/projetos/${projetoId}#prazos`,
    );
    const rows = await registros();
    expect(rows).toHaveLength(2);
    expect(rows[0].situacao).toBe(SituacaoAvisoEmail.ENVIADO);
    expect(rows[0].messageId).toBe('<id@relay>');
  });

  it('várias metas viram um resumo por pessoa, e a meta nova sai só com ela', async () => {
    await goal(brasilia(3));
    await goal(brasilia(10));
    await goal(brasilia(-2));

    await notices.runDaily();

    expect(destinatarios()).toEqual([COORDENADORA, RESPONSAVEL].sort());
    const [resumo] = send.mock.calls[0];
    expect(resumo.subject).toBe('3 avisos de metas');
    expect(resumo.html).toContain('Vencidas');
    expect(resumo.html).toContain('P01, meta 1');
    expect(resumo.html).toContain('P01, meta 3');
    expect(await registros()).toHaveLength(6);

    send.mockClear();
    await goal(brasilia(4));
    await notices.runDaily();

    expect(send).toHaveBeenCalledTimes(2);
    const [novo] = send.mock.calls[0];
    expect(novo.subject).toBe('1 aviso de meta');
    expect(novo.html).toContain('P01, meta 4');
    expect(novo.html).not.toContain('P01, meta 1');
  });

  it('prazo novo gera aviso novo', async () => {
    const meta = await goal(brasilia(10));
    await notices.runDaily();
    send.mockClear();

    await prisma.meta.update({
      where: { id: meta.id },
      data: { periodoFim: day(brasilia(20)) },
    });
    await notices.runDaily();

    expect(destinatarios()).toEqual([COORDENADORA, RESPONSAVEL].sort());
  });

  it('não avisa prazo distante, meta concluída nem instrumento desativado', async () => {
    await goal(brasilia(31));
    const concluida = await goal(brasilia(5));
    await prisma.meta.update({
      where: { id: concluida.id },
      data: { situacao: SituacaoMeta.CONCLUIDA },
    });
    await notices.runDaily();
    expect(send).not.toHaveBeenCalled();

    await goal(brasilia(5));
    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });
    await notices.runDaily();
    expect(send).not.toHaveBeenCalled();
  });

  it('avisa meta vencida e não repete', async () => {
    await goal(brasilia(-1));

    await notices.runDaily();
    await notices.runDaily();

    expect(destinatarios()).toEqual([COORDENADORA, RESPONSAVEL].sort());
    expect(send.mock.calls[0][0].html).toContain('Vencidas');
  });

  it('meta sem responsável avisa a coordenação e a gestão, sem repetir a pessoa', async () => {
    await goal(null, null);

    await notices.runDaily();

    expect(destinatarios()).toEqual([COORDENADORA, SEGUNDA_GESTAO].sort());
    expect(send.mock.calls[0][0].html).toContain('Sem responsável');
  });

  it('conta inativa não recebe', async () => {
    await goal(brasilia(5));
    await prisma.usuario.update({ where: { id: ids[RESPONSAVEL] }, data: { ativo: false } });

    await notices.runDaily();
    await prisma.usuario.update({ where: { id: ids[RESPONSAVEL] }, data: { ativo: true } });

    expect(destinatarios()).toEqual([COORDENADORA]);
  });

  it('conta mudada para perfil sem acesso às metas não recebe', async () => {
    await goal(brasilia(5));
    const id = ids[RESPONSAVEL];
    await prisma.usuario.update({
      where: { id },
      data: { perfil: Perfil.CONCEDENTE_AUDITORIA },
    });

    await notices.runDaily();
    await prisma.usuario.update({ where: { id }, data: { perfil: Perfil.NUCLEO_PEDAGOGICO } });

    expect(destinatarios()).toEqual([COORDENADORA]);
  });

  it('falha definida fica registrada, não interrompe os demais e repete até 3 vezes', async () => {
    await goal(brasilia(5));
    send.mockRejectedValueOnce(new EmailDeliveryError('BREVO_429', false));

    await notices.runDaily();

    expect(send).toHaveBeenCalledTimes(2);
    const falha = (await registros()).find((row) => row.situacao === SituacaoAvisoEmail.FALHOU);
    expect(falha).toMatchObject({ erro: 'BREVO_429', tentativas: 1 });

    send.mockClear();
    send.mockRejectedValue(new EmailDeliveryError('BREVO_500', false));
    await notices.runDaily();
    await notices.runDaily();
    await notices.runDaily();

    expect(send).toHaveBeenCalledTimes(2);
    expect(await prisma.avisoEmail.findUnique({ where: { id: falha?.id } })).toMatchObject({
      situacao: SituacaoAvisoEmail.FALHOU,
      tentativas: 3,
    });
  });

  it('timeout fica incerto e não reenvia', async () => {
    await goal(brasilia(5));
    send.mockRejectedValue(new EmailDeliveryError('BREVO_TIMEOUT', true));

    await notices.runDaily();
    send.mockClear();
    await notices.runDaily();

    expect(send).not.toHaveBeenCalled();
    expect((await registros()).map((row) => row.situacao)).toEqual([
      SituacaoAvisoEmail.INCERTO,
      SituacaoAvisoEmail.INCERTO,
    ]);
  });

  it('destinatário fora da lista não chama o provedor', async () => {
    await goal(brasilia(5));
    accepts.mockReturnValue(false);

    await notices.runDaily();

    expect(send).not.toHaveBeenCalled();
    expect((await registros()).map((row) => row.situacao)).toEqual([
      SituacaoAvisoEmail.BLOQUEADO,
      SituacaoAvisoEmail.BLOQUEADO,
    ]);
  });

  describe('aviso adicional na meta (RN-03)', () => {
    function as(perfil: Perfil) {
      const server = request(app.getHttpServer());
      const auth = `Bearer ${tokens[perfil]}`;
      return {
        get: (path: string) => server.get(path).set('Authorization', auth),
        post: (path: string, body: object) =>
          server.post(path).set('Authorization', auth).send(body),
        delete: (path: string) => server.delete(path).set('Authorization', auth),
      };
    }

    it('a gestão registra e remove, com trilha; outros perfis só leem', async () => {
      const meta = await goal(brasilia(60));
      const body = { dataAviso: brasilia(5), mensagem: 'Conferir a lista antes do fechamento.' };

      await as(Perfil.NUCLEO_PEDAGOGICO).post(`/v1/goals/${meta.id}/notices`, body).expect(403);
      const criado = await as(Perfil.PRESIDENCIA_GESTAO)
        .post(`/v1/goals/${meta.id}/notices`, body)
        .expect(201);
      const { id } = criado.body as { id: string };

      const lista = await as(Perfil.NUCLEO_PEDAGOGICO)
        .get(`/v1/goals/${meta.id}/notices`)
        .expect(200);
      expect(lista.body).toMatchObject([{ id, ...body, criadoPor: COORDENADORA }]);

      await as(Perfil.NUCLEO_PEDAGOGICO).delete(`/v1/goals/${meta.id}/notices/${id}`).expect(403);
      await as(Perfil.PRESIDENCIA_GESTAO).delete(`/v1/goals/${meta.id}/notices/${id}`).expect(204);

      const trilha = await prisma.trilhaAuditoria.findMany({
        where: { entidade: 'aviso_meta', entidadeId: id },
        orderBy: { criadoEm: 'asc' },
      });
      expect(trilha.map((row) => row.acao)).toEqual(['GOAL_NOTICE_CREATED', 'GOAL_NOTICE_REMOVED']);
    });

    it('recusa data passada e mensagem vazia', async () => {
      const meta = await goal(brasilia(60));

      const passada = await as(Perfil.PRESIDENCIA_GESTAO)
        .post(`/v1/goals/${meta.id}/notices`, { dataAviso: brasilia(-1), mensagem: 'Aviso' })
        .expect(400);
      expect((passada.body as { code: string }).code).toBe('PAST_NOTICE_DATE');
      await as(Perfil.PRESIDENCIA_GESTAO)
        .post(`/v1/goals/${meta.id}/notices`, { dataAviso: brasilia(1), mensagem: '   ' })
        .expect(400);
    });

    it('envia na data, uma vez, e o aviso enviado não pode ser removido', async () => {
      const meta = await goal(brasilia(60));
      const criado = await as(Perfil.PRESIDENCIA_GESTAO)
        .post(`/v1/goals/${meta.id}/notices`, { dataAviso: brasilia(1), mensagem: 'Revisar <já>' })
        .expect(201);
      const { id } = criado.body as { id: string };

      await notices.runDaily();
      expect(send).not.toHaveBeenCalled();

      const amanha = new Date(Date.now() + DAY);
      await notices.runDaily(amanha);
      await notices.runDaily(amanha);

      expect(destinatarios()).toEqual([COORDENADORA, RESPONSAVEL].sort());
      const [mensagem] = send.mock.calls[0];
      expect(mensagem.tag).toBe('RESUMO_METAS');
      expect(mensagem.subject).toBe('1 aviso de meta');
      expect(mensagem.text).toContain('Revisar <já>');
      expect(mensagem.html).toContain('Revisar &lt;já&gt;');

      await prisma.avisoMeta.update({
        where: { id },
        data: { dataAviso: day(brasilia(0)) },
      });
      const recusado = await as(Perfil.PRESIDENCIA_GESTAO)
        .delete(`/v1/goals/${meta.id}/notices/${id}`)
        .expect(409);
      expect((recusado.body as { code: string }).code).toBe('NOTICE_ALREADY_DUE');
    });
  });
});
