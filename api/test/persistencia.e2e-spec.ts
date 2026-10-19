import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import { Perfil, TipoInstrumento, OrigemMeta } from '../src/generated/prisma/enums.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Persistencia (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, meta_requisito, meta, projeto, requisito_instrumento, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  async function criarUsuario(emailLogin: string, cpf?: string) {
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Pessoa de teste', cpf } });
    return prisma.usuario.create({
      data: {
        pessoaId: pessoa.id,
        emailLogin,
        senhaHash: 'hash',
        perfil: Perfil.PRESIDENCIA_GESTAO,
      },
    });
  }

  async function criarInstrumento(numeroProcesso: string) {
    return prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.PARCERIA,
        orgaoConcedente: 'Ministerio de teste',
        numeroProcesso,
        valorGlobal: '155000.00',
        dataCelebracao: new Date('2025-12-31'),
        vigenciaInicio: new Date('2025-12-31'),
        vigenciaFim: new Date('2026-07-26'),
      },
    });
  }

  it('GET /v1/health informa o banco', async () => {
    const res = await request(app.getHttpServer()).get('/v1/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', banco: 'ok' });
  });

  it('pessoa sem conta e sem CPF e valida; usuario sem pessoa e invalido', async () => {
    const pessoa = await prisma.pessoa.create({ data: { nome: 'Sem conta' } });
    expect(pessoa.cpf).toBeNull();

    await expect(
      prisma.usuario.create({
        data: {
          pessoaId: '00000000-0000-0000-0000-000000000000',
          emailLogin: 'x@teste.local',
          senhaHash: 'hash',
          perfil: Perfil.NUCLEO_PEDAGOGICO,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('segunda conta para a mesma pessoa e impedida', async () => {
    const usuario = await criarUsuario('um@teste.local');
    await expect(
      prisma.usuario.create({
        data: {
          pessoaId: usuario.pessoaId,
          emailLogin: 'dois@teste.local',
          senhaHash: 'hash',
          perfil: Perfil.NUCLEO_PEDAGOGICO,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('CPF repetido com valor preenchido e rejeitado; duas pessoas sem CPF convivem', async () => {
    await prisma.pessoa.create({ data: { nome: 'A', cpf: '12345678909' } });
    await expect(
      prisma.pessoa.create({ data: { nome: 'B', cpf: '12345678909' } }),
    ).rejects.toMatchObject({
      code: 'P2002',
    });
    await prisma.pessoa.create({ data: { nome: 'C' } });
    await prisma.pessoa.create({ data: { nome: 'D' } });
    expect(await prisma.pessoa.count()).toBe(3);
  });

  it('numero de processo repetido e aceito, com referencias independentes', async () => {
    const a = await criarInstrumento('71000.057425/2025-03');
    const b = await criarInstrumento('71000.057425/2025-03');
    expect(a.id).not.toBe(b.id);
    expect(
      await prisma.instrumento.count({ where: { numeroProcesso: '71000.057425/2025-03' } }),
    ).toBe(2);
  });

  it('codigo de projeto e unico por instrumento, nao entre instrumentos', async () => {
    const coordenador = await criarUsuario('coord@teste.local');
    const a = await criarInstrumento('A');
    const b = await criarInstrumento('B');
    const dados = {
      coordenadorId: coordenador.id,
      codigo: 'EPG',
      titulo: 'Escola Popular',
      inicio: new Date('2026-01-01'),
      fim: new Date('2026-06-30'),
    };
    await prisma.projeto.create({ data: { ...dados, instrumentoId: a.id } });
    await prisma.projeto.create({ data: { ...dados, instrumentoId: b.id } });
    await expect(
      prisma.projeto.create({ data: { ...dados, instrumentoId: a.id } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('meta liga-se a requisito do mesmo instrumento por N:N; vinculo cruzado e detectavel na transacao', async () => {
    const coordenador = await criarUsuario('coord@teste.local');
    const a = await criarInstrumento('A');
    const b = await criarInstrumento('B');
    const projetoA = await prisma.projeto.create({
      data: {
        instrumentoId: a.id,
        coordenadorId: coordenador.id,
        codigo: 'EPG',
        titulo: 'Escola Popular',
        inicio: new Date('2026-01-01'),
        fim: new Date('2026-06-30'),
      },
    });
    const requisitoA1 = await prisma.requisitoInstrumento.create({
      data: { instrumentoId: a.id, descricao: '70% de frequencia' },
    });
    const requisitoA2 = await prisma.requisitoInstrumento.create({
      data: { instrumentoId: a.id, descricao: 'Certificados emitidos' },
    });
    const requisitoB = await prisma.requisitoInstrumento.create({
      data: { instrumentoId: b.id, descricao: 'De outro instrumento' },
    });
    const meta = await prisma.meta.create({
      data: {
        projetoId: projetoA.id,
        ordem: 1,
        origem: OrigemMeta.EDITAL,
        objetivo: 'Capacitar 30 pessoas',
        descricao: 'Curso de 56 horas',
      },
    });

    await prisma.metaRequisito.createMany({
      data: [
        { metaId: meta.id, requisitoId: requisitoA1.id },
        { metaId: meta.id, requisitoId: requisitoA2.id },
      ],
    });
    expect(await prisma.metaRequisito.count({ where: { metaId: meta.id } })).toBe(2);

    const vinculoCruzado = prisma.$transaction(async (tx) => {
      const [m, r] = await Promise.all([
        tx.meta.findUniqueOrThrow({ where: { id: meta.id }, include: { projeto: true } }),
        tx.requisitoInstrumento.findUniqueOrThrow({ where: { id: requisitoB.id } }),
      ]);
      if (m.projeto.instrumentoId !== r.instrumentoId) {
        throw new Error('VINCULO_CRUZADO');
      }
      await tx.metaRequisito.create({ data: { metaId: meta.id, requisitoId: requisitoB.id } });
    });
    await expect(vinculoCruzado).rejects.toThrow('VINCULO_CRUZADO');
    expect(await prisma.metaRequisito.count({ where: { requisitoId: requisitoB.id } })).toBe(0);
  });

  it('meta incompleta persiste como rascunho derivado, sem coluna de estado', async () => {
    const coordenador = await criarUsuario('coord@teste.local');
    const a = await criarInstrumento('A');
    const projeto = await prisma.projeto.create({
      data: {
        instrumentoId: a.id,
        coordenadorId: coordenador.id,
        codigo: 'EPG',
        titulo: 'T',
        inicio: new Date('2026-01-01'),
        fim: new Date('2026-06-30'),
      },
    });
    const meta = await prisma.meta.create({
      data: {
        projetoId: projeto.id,
        ordem: 1,
        origem: OrigemMeta.PROJETO,
        objetivo: 'O',
        descricao: 'D',
      },
    });
    const rascunho =
      !meta.indicador || !meta.formaComprovacao || !meta.periodoInicio || !meta.periodoFim;
    expect(rascunho).toBe(true);
  });

  it('exclusao de pessoa com conta e impedida (Restrict)', async () => {
    const usuario = await criarUsuario('coord@teste.local');
    await expect(prisma.pessoa.delete({ where: { id: usuario.pessoaId } })).rejects.toMatchObject({
      code: 'P2003',
    });
  });

  it('trilha aceita autor de sistema sem usuario e autor usuario com referencia', async () => {
    const usuario = await criarUsuario('coord@teste.local');
    await prisma.trilhaAuditoria.create({
      data: {
        autorTipo: 'SISTEMA',
        acao: 'BOOTSTRAP',
        entidade: 'usuario',
        entidadeId: usuario.id,
        correlationId: 'c-1',
      },
    });
    await prisma.trilhaAuditoria.create({
      data: {
        autorTipo: 'USUARIO',
        usuarioId: usuario.id,
        acao: 'CRIAR',
        entidade: 'instrumento',
        correlationId: 'c-2',
        depois: { tipo: 'PARCERIA' },
      },
    });
    expect(await prisma.trilhaAuditoria.count()).toBe(2);
  });
});
