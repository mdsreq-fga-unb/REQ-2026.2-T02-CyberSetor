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
import type { DuplicateCheckResponse } from '../src/participants/participants.dto.js';
import type { Prisma } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { DATA_NOTICE } from '../src/public-registrations/notice.js';
import type { AssistedRegistrationResponse } from '../src/registrations/registrations.dto.js';
import { termVersion } from '../src/registrations/term.js';

interface ErrorResponse {
  code: string;
  message?: string;
}

const PASSWORD = 'senha longa de quem testa';
const CPF_ADULTO = '52998224725';
const CPF_MENOR = '11144477735';
const CPF_EXISTENTE = '39053344705';

function bornYearsAgo(anos: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - anos);
  date.setUTCDate(date.getUTCDate() - 2);
  return date.toISOString().slice(0, 10);
}

describe('Inscrição presencial assistida e detecção de duplicidade (HU-08 / e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const userIds = {} as Record<Perfil, string>;
  let atividadeId: string;
  let atividadeVagasId: string;
  let participanteExistenteId: string;

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
      const usuario = await prisma.usuario.create({
        data: { pessoaId: pessoa.id, emailLogin, senhaHash, perfil, deveTrocarSenha: false },
      });
      userIds[perfil] = usuario.id;

      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: emailLogin, senha: PASSWORD })
        .expect(200);
      tokens[perfil] = (res.body as { accessToken: string }).accessToken;
    }

    const modalidade = await prisma.modalidade.create({
      data: { nome: 'Oficina de Teatro' },
    });

    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Secretaria de Cultura',
        numeroProcesso: '001/2026',
        valorGlobal: '100000.00',
        dataCelebracao: new Date('2026-01-10T00:00:00.000Z'),
        vigenciaInicio: new Date('2026-02-01T00:00:00.000Z'),
        vigenciaFim: new Date('2026-12-31T00:00:00.000Z'),
        ativo: true,
      },
    });

    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId: instrumento.id,
        coordenadorId: userIds[Perfil.NUCLEO_PEDAGOGICO],
        codigo: 'PRJ-01',
        titulo: 'Arte e Cidadania',
        inicio: new Date('2026-02-01T00:00:00.000Z'),
        fim: new Date('2026-12-31T00:00:00.000Z'),
      },
    });

    const atv1 = await prisma.atividade.create({
      data: {
        projetoId: projeto.id,
        modalidadeId: modalidade.id,
        responsavelId: userIds[Perfil.NUCLEO_PEDAGOGICO],
        titulo: 'Oficina de Expressão Corporal',
        data: new Date('2026-11-20T00:00:00.000Z'),
        local: 'Galpão Cultural',
      },
    });
    atividadeId = atv1.id;

    await prisma.configuracaoInscricao.create({
      data: {
        atividadeId: atv1.id,
        vagas: 20,
        camposAdicionais: [CampoInscricao.CPF, CampoInscricao.EMAIL],
        campoDuplicidade: CampoDuplicidade.CPF,
        codigoPublico: 'codigo-pub-1',
        aberta: true,
      },
    });

    const atv2 = await prisma.atividade.create({
      data: {
        projetoId: projeto.id,
        modalidadeId: modalidade.id,
        responsavelId: userIds[Perfil.NUCLEO_PEDAGOGICO],
        titulo: 'Oficina Rápida (1 vaga)',
        data: new Date('2026-11-25T00:00:00.000Z'),
        local: 'Sala 02',
      },
    });
    atividadeVagasId = atv2.id;

    await prisma.configuracaoInscricao.create({
      data: {
        atividadeId: atv2.id,
        vagas: 1,
        camposAdicionais: [CampoInscricao.CPF],
        campoDuplicidade: CampoDuplicidade.CPF,
        codigoPublico: 'codigo-pub-vagas',
        aberta: true,
      },
    });

    const pExistente = await prisma.participante.create({
      data: {
        nome: 'Maria Existente',
        telefone: '61988887777',
        dataNascimento: new Date('1995-03-12T00:00:00.000Z'),
        cpf: CPF_EXISTENTE,
        email: 'maria.existente@teste.com',
        // Cadastro de uma inscrição antiga, como no uso real.
        criadoEm: new Date('2026-09-01T12:00:00.000Z'),
      },
    });
    participanteExistenteId = pExistente.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const as = (perfil: Perfil) => {
    const server = request(app.getHttpServer());
    const auth = `Bearer ${tokens[perfil]}`;
    return {
      get: (path: string) => server.get(path).set('Authorization', auth),
      post: (path: string, body?: object) =>
        server.post(path).set('Authorization', auth).send(body),
    };
  };
  const nucleo = () => as(Perfil.NUCLEO_PEDAGOGICO);

  describe('POST /v1/participants/check-duplicate', () => {
    it('bloqueia perfis sem acesso a dados nominais com 403 (RNF04)', async () => {
      const restritos = [
        Perfil.PRESIDENCIA_GESTAO,
        Perfil.ADMINISTRATIVO_FINANCEIRO,
        Perfil.CONCEDENTE_AUDITORIA,
        Perfil.ADMINISTRACAO_SISTEMA,
      ];
      for (const perfil of restritos) {
        const res = await as(perfil)
          .post('/v1/participants/check-duplicate')
          .send({ cpf: CPF_EXISTENTE });
        expect(res.status).toBe(403);
      }
    });

    it('retorna existe: false quando CPF e e-mail não existem', async () => {
      const res = await nucleo().post('/v1/participants/check-duplicate').send({ cpf: CPF_ADULTO });

      expect(res.status).toBe(200);
      const body = res.body as DuplicateCheckResponse;
      expect(body.existe).toBe(false);
      expect(body.participante).toBeNull();
    });

    it('detecta duplicidade por CPF e retorna dados mascarados do participante existente (CA-08.3, RNF05)', async () => {
      const res = await nucleo()
        .post('/v1/participants/check-duplicate')
        .send({ cpf: CPF_EXISTENTE });

      expect(res.status).toBe(200);
      const body = res.body as DuplicateCheckResponse;
      expect(body.existe).toBe(true);
      expect(body.participante?.id).toBe(participanteExistenteId);
      expect(body.participante?.nome).toBe('Maria Existente');
      expect(body.participante?.cpfMascarado).toContain('***');
      expect(body.participante?.camposDisponiveis).toContain('cpf');
    });

    it('detecta duplicidade por E-mail (CA-08.3, RNF05)', async () => {
      const res = await nucleo()
        .post('/v1/participants/check-duplicate')
        .send({ email: 'maria.existente@teste.com' });

      expect(res.status).toBe(200);
      const body = res.body as DuplicateCheckResponse;
      expect(body.existe).toBe(true);
      expect(body.participante?.id).toBe(participanteExistenteId);
      expect(body.participante?.emailMascarado).toContain('***');
    });
  });

  describe('POST /v1/activities/:id/registration/assisted', () => {
    it('bloqueia perfis sem permissão para inscrição assistida com 403 (RNF04)', async () => {
      const payload = {
        nome: 'Carlos Adulto',
        telefone: '61981112233',
        dataNascimento: bornYearsAgo(25),
        cpf: CPF_ADULTO,
        email: 'carlos@teste.com',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: true,
        autorizaImagem: false,
      };

      const restritos = [
        Perfil.PRESIDENCIA_GESTAO,
        Perfil.ADMINISTRATIVO_FINANCEIRO,
        Perfil.CONCEDENTE_AUDITORIA,
        Perfil.ADMINISTRACAO_SISTEMA,
      ];
      for (const perfil of restritos) {
        const res = await as(perfil).post(
          `/v1/activities/${atividadeId}/registration/assisted`,
          payload,
        );
        expect(res.status).toBe(403);
      }
    });

    it('realiza inscrição assistida de adulto com vaga confirmada e auditoria (CA-08.1, CA-08.4)', async () => {
      const payload = {
        nome: 'Carlos Adulto',
        telefone: '61981112233',
        dataNascimento: bornYearsAgo(25),
        cpf: CPF_ADULTO,
        email: 'carlos@teste.com',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: true,
        autorizaImagem: false,
      };

      const res = await nucleo().post(
        `/v1/activities/${atividadeId}/registration/assisted`,
        payload,
      );

      expect(res.status).toBe(201);
      const body = res.body as AssistedRegistrationResponse;
      expect(body.situacao).toBe(SituacaoInscricao.CONFIRMADA);
      expect(body.posicaoEspera).toBeNull();
      expect(body.reaproveitouParticipante).toBe(false);
      expect(body.participante.nome).toBe('Carlos Adulto');

      // Conferir gravação de criadoPorId na inscrição
      const inscricaoNoBanco = await prisma.inscricao.findUnique({
        where: { id: body.id },
      });
      expect(inscricaoNoBanco).not.toBeNull();
      expect(inscricaoNoBanco?.criadoPorId).toBe(userIds[Perfil.NUCLEO_PEDAGOGICO]);

      // Trilha de auditoria sem PII
      const trilha = await prisma.trilhaAuditoria.findFirst({
        where: { acao: 'ASSISTED_REGISTRATION_CREATED', entidadeId: body.id },
      });
      expect(trilha).not.toBeNull();
      expect(trilha?.usuarioId).toBe(userIds[Perfil.NUCLEO_PEDAGOGICO]);
      const depois = trilha?.depois as Record<string, unknown>;
      expect(depois.situacao).toBe(SituacaoInscricao.CONFIRMADA);
      expect(depois.nome).toBeUndefined();
      expect(depois.cpf).toBeUndefined();
    });

    it('recusa inscrição repetida da mesma pessoa na mesma atividade (409 ALREADY_REGISTERED)', async () => {
      const payload = {
        nome: 'Carlos Adulto Outra Vez',
        telefone: '61981112233',
        dataNascimento: bornYearsAgo(25),
        cpf: CPF_ADULTO,
        email: 'carlos2@teste.com',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: false,
        autorizaImagem: false,
      };

      const res = await nucleo().post(
        `/v1/activities/${atividadeId}/registration/assisted`,
        payload,
      );

      expect(res.status).toBe(409);
      const body = res.body as ErrorResponse;
      expect(body.code).toBe('ALREADY_REGISTERED');
    });

    it('recusa inscrição assistida de menor de 18 anos sem responsável legal (400 GUARDIAN_REQUIRED)', async () => {
      const payload = {
        nome: 'Lucas Menor',
        telefone: '61977778888',
        dataNascimento: bornYearsAgo(16),
        cpf: CPF_MENOR,
        email: 'lucas@teste.com',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: false,
        autorizaImagem: false,
      };

      const res = await nucleo().post(
        `/v1/activities/${atividadeId}/registration/assisted`,
        payload,
      );

      expect(res.status).toBe(400);
      const body = res.body as ErrorResponse;
      expect(body.code).toBe('GUARDIAN_REQUIRED');
    });

    it('permite inscrição de menor quando responsável legal é informado (RN-06)', async () => {
      const payload = {
        nome: 'Lucas Menor',
        telefone: '61977778888',
        dataNascimento: bornYearsAgo(16),
        cpf: CPF_MENOR,
        email: 'lucas@teste.com',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: false,
        autorizaImagem: true,
        responsavelNome: 'Mãe do Lucas',
        responsavelTelefone: '61988889999',
      };

      const res = await nucleo().post(
        `/v1/activities/${atividadeId}/registration/assisted`,
        payload,
      );

      expect(res.status).toBe(201);
      const body = res.body as AssistedRegistrationResponse;
      expect(body.situacao).toBe(SituacaoInscricao.CONFIRMADA);
    });

    it('reaproveita cadastro existente sem criar novo participante (CA-08.3, RF22)', async () => {
      const participantesAntes = await prisma.participante.count();

      const payload = {
        reaproveitarParticipanteId: participanteExistenteId,
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: true,
        autorizaImagem: true,
      };

      const res = await nucleo().post(
        `/v1/activities/${atividadeId}/registration/assisted`,
        payload,
      );

      expect(res.status).toBe(201);
      const body = res.body as AssistedRegistrationResponse;
      expect(body.reaproveitouParticipante).toBe(true);
      expect(body.participante.id).toBe(participanteExistenteId);
      expect(body.participante.nome).toBe('Maria Existente');

      const participantesDepois = await prisma.participante.count();
      expect(participantesDepois).toBe(participantesAntes); // Não duplicou
    });

    it('a lista de inscritos indica o cadastro que já existia antes da inscrição (RF22, D2 de 29/10)', async () => {
      const res = await nucleo().get(`/v1/activities/${atividadeId}/registrations`);
      expect(res.status).toBe(200);
      const inscricoes = (
        res.body as { inscricoes: { nome: string; cadastroExistente: string | null }[] }
      ).inscricoes;
      const porNome = new Map(inscricoes.map((i) => [i.nome, i.cadastroExistente]));
      // Reaproveitado na inscrição presencial: o cadastro já existia.
      expect(porNome.get('Maria Existente')).toBe('REAPROVEITADO');
      // Cadastro novo, criado na própria inscrição: sem indicador.
      for (const [nome, indicador] of porNome) {
        if (nome !== 'Maria Existente') expect(indicador).toBeNull();
      }
    });

    it('respeita o limite de vagas e envia excedente para a lista de espera (CA-08.2, RF14, RF15)', async () => {
      // Atividade atv2 tem vagas = 1
      const p1 = {
        nome: 'Primeiro a Chegar',
        telefone: '61991112222',
        dataNascimento: bornYearsAgo(30),
        cpf: '12345678909',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: true,
        autorizaImagem: false,
      };

      const res1 = await nucleo().post(
        `/v1/activities/${atividadeVagasId}/registration/assisted`,
        p1,
      );

      expect(res1.status).toBe(201);
      const body1 = res1.body as AssistedRegistrationResponse;
      expect(body1.situacao).toBe(SituacaoInscricao.CONFIRMADA);
      expect(body1.posicaoEspera).toBeNull();

      // Segundo participante deve ir para LISTA_ESPERA na posição 1
      const p2 = {
        nome: 'Segundo a Chegar',
        telefone: '61993334444',
        dataNascimento: bornYearsAgo(22),
        cpf: '98765432100',
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: false,
        autorizaImagem: true,
      };

      const res2 = await nucleo().post(
        `/v1/activities/${atividadeVagasId}/registration/assisted`,
        p2,
      );

      expect(res2.status).toBe(201);
      const body2 = res2.body as AssistedRegistrationResponse;
      expect(body2.situacao).toBe(SituacaoInscricao.LISTA_ESPERA);
      expect(body2.posicaoEspera).toBe(1);
    });

    /** Atividade nova com a mesma origem da primeira e a configuração pedida. */
    async function atividadeCom(config: Partial<Prisma.ConfiguracaoInscricaoUncheckedCreateInput>) {
      const base = await prisma.atividade.findUniqueOrThrow({ where: { id: atividadeId } });
      const atividade = await prisma.atividade.create({
        data: {
          projetoId: base.projetoId,
          modalidadeId: base.modalidadeId,
          responsavelId: base.responsavelId,
          titulo: `Oficina ${Math.random()}`,
          data: base.data,
          local: base.local,
        },
      });
      await prisma.configuracaoInscricao.create({
        data: {
          atividadeId: atividade.id,
          vagas: 10,
          camposAdicionais: [CampoInscricao.EMAIL],
          campoDuplicidade: CampoDuplicidade.EMAIL,
          codigoPublico: `codigo-${atividade.id.slice(0, 8)}`,
          aberta: true,
          ...config,
        },
      });
      return `/v1/activities/${atividade.id}/registration/assisted`;
    }

    const adulto = (n: number) => ({
      nome: `Pessoa Presencial ${n}`,
      telefone: '61990000000',
      dataNascimento: bornYearsAgo(30),
      email: `presencial${n}@exemplo.com`,
      versaoAviso: DATA_NOTICE.versao,
      autorizaComunicados: false,
      autorizaImagem: false,
    });

    it('com compromissos da turma, exige o aceite tambem na inscricao presencial', async () => {
      const termo = 'Chegar no horário.';
      const path = await atividadeCom({ termoCompromisso: termo });

      const sem = await nucleo().post(path, adulto(1));
      expect(sem.status).toBe(400);
      expect((sem.body as { code: string }).code).toBe('TERM_NOT_ACCEPTED');

      const com = await nucleo().post(path, { ...adulto(1), versaoTermo: termVersion(termo) });
      expect(com.status).toBe(201);
      const inscricao = await prisma.inscricao.findUniqueOrThrow({
        where: { id: (com.body as AssistedRegistrationResponse).id },
      });
      expect(inscricao).toMatchObject({
        termoAceito: termo,
        criadoPorId: userIds[Perfil.NUCLEO_PEDAGOGICO],
      });
    });

    it('prazo vencido encerra tambem a inscricao presencial', async () => {
      const path = await atividadeCom({ prazoInscricao: new Date('2020-01-01T00:00:00.000Z') });

      const res = await nucleo().post(path, adulto(2));

      expect(res.status).toBe(409);
      expect((res.body as { code: string }).code).toBe('REGISTRATION_CLOSED');
    });

    it('vagas esgotadas sem lista de espera respondem como no formulario publico', async () => {
      const path = await atividadeCom({ vagas: 1, listaEspera: false });
      await nucleo().post(path, adulto(3)).expect(201);

      const res = await nucleo().post(path, adulto(4));

      expect(res.status).toBe(409);
      expect((res.body as { code: string }).code).toBe('REGISTRATION_FULL');
    });

    it('reaproveitar cadastro sem o dado pedido exige o dado e completa o cadastro', async () => {
      const path = await atividadeCom({});
      const semEmail = await prisma.participante.create({
        data: {
          nome: 'Joana Sem Email',
          telefone: '61977776666',
          dataNascimento: new Date('1990-01-01T00:00:00.000Z'),
        },
      });
      const reuso = {
        reaproveitarParticipanteId: semEmail.id,
        versaoAviso: DATA_NOTICE.versao,
        autorizaComunicados: false,
        autorizaImagem: false,
      };

      const falta = await nucleo().post(path, reuso);
      expect(falta.status).toBe(400);
      expect((falta.body as { code: string }).code).toBe('MISSING_FIELDS');

      const completo = await nucleo().post(path, { ...reuso, email: 'joana@exemplo.com' });
      expect(completo.status).toBe(201);
      expect(
        (await prisma.participante.findUniqueOrThrow({ where: { id: semEmail.id } })).email,
      ).toBe('joana@exemplo.com');
    });

    it('a checagem de duplicidade devolve so o nome e os contatos mascarados', async () => {
      const res = await nucleo()
        .post('/v1/participants/check-duplicate')
        .send({ cpf: CPF_EXISTENTE });

      const participante = (res.body as DuplicateCheckResponse).participante;
      expect(Object.keys(participante ?? {}).sort()).toEqual([
        'camposDisponiveis',
        'cpfMascarado',
        'emailMascarado',
        'id',
        'nome',
        'telefoneMascarado',
      ]);
      expect(participante?.telefoneMascarado).toBe('(**) *****-7777');
    });
    it('o formulário público com o CPF de um cadastro anterior aparece como possível repetido', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/public/registrations/codigo-pub-vagas')
        .send({
          nome: 'Maria pelo Formulário',
          telefone: '61977776666',
          dataNascimento: '1995-03-12',
          cpf: CPF_EXISTENTE,
          versaoAviso: DATA_NOTICE.versao,
          autorizaComunicados: false,
          autorizaImagem: false,
        });
      expect(res.status).toBe(201);
      const lista = await nucleo().get(`/v1/activities/${atividadeVagasId}/registrations`);
      expect(lista.status).toBe(200);
      const inscricoes = (
        lista.body as { inscricoes: { nome: string; cadastroExistente: string | null }[] }
      ).inscricoes;
      expect(inscricoes.find((i) => i.nome === 'Maria pelo Formulário')?.cadastroExistente).toBe(
        'CPF',
      );
      // Só o indicador: os dados do outro cadastro não aparecem na lista (RNF05).
      expect(JSON.stringify(lista.body)).not.toContain('maria.existente@teste.com');
    });
  });
});
