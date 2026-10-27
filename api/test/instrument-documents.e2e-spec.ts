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
const MISSING = '00000000-0000-4000-8000-000000000000';

const PDF = Buffer.from('%PDF-1.7\n1 0 obj << >> endobj\n%%EOF\n');
const PDF_NOVO = Buffer.from('%PDF-1.7\nversao assinada do termo\n%%EOF\n');

function docx(): Buffer {
  const header = Buffer.alloc(4);
  header.writeUInt32LE(0x04034b50, 0);
  return Buffer.concat([header, Buffer.from('[Content_Types].xml\0word/document.xml\0')]);
}

interface DocumentBody {
  nomeArquivo: string;
  tipoConteudo: string;
  tamanho: number;
  sha256: string;
  enviadoPor: { id: string; nome: string };
  url?: string;
  expiraEm?: string;
}

interface ErrorBody {
  code: string;
  message: string;
}

describe('Documento formal do instrumento (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const tokens = {} as Record<Perfil, string>;
  const ids = {} as Record<Perfil, string>;
  let instrumentoId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { corsOrigin: '' });
    await app.init();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE trilha_auditoria, sessao, instrumento, usuario, pessoa, setor RESTART IDENTITY CASCADE',
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
      'TRUNCATE TABLE trilha_auditoria, instrumento RESTART IDENTITY CASCADE',
    );
    const instrumento = await prisma.instrumento.create({
      data: {
        tipo: TipoInstrumento.EMENDA,
        orgaoConcedente: 'Secretaria de Cultura',
        numeroProcesso: '00150-00001234/2026-11',
        valorGlobal: '150000.00',
        dataCelebracao: new Date('2026-03-10'),
        vigenciaInicio: new Date('2026-04-01'),
        vigenciaFim: new Date('2027-03-31'),
      },
    });
    instrumentoId = instrumento.id;
  });

  afterAll(async () => {
    await app.close();
  });

  function server() {
    return request(app.getHttpServer());
  }

  function upload(perfil: Perfil, body: Buffer, filename: string, id = instrumentoId) {
    return server()
      .put(`/v1/instruments/${id}/document`)
      .set('Authorization', `Bearer ${tokens[perfil]}`)
      .attach('arquivo', body, { filename, contentType: 'application/octet-stream' });
  }

  function open(perfil: Perfil, id = instrumentoId) {
    return server()
      .get(`/v1/instruments/${id}/document`)
      .set('Authorization', `Bearer ${tokens[perfil]}`);
  }

  function linkPath(url: string): string {
    return new URL(url).pathname;
  }

  it('anexa o PDF, abre pelo link assinado e registra na trilha', async () => {
    const sent = await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'Termo de Fomento nº 12.pdf').expect(
      200,
    );
    expect(sent.body as DocumentBody).toMatchObject({
      nomeArquivo: 'Termo de Fomento nº 12.pdf',
      tipoConteudo: 'application/pdf',
      tamanho: PDF.length,
      enviadoPor: { id: ids[Perfil.PRESIDENCIA_GESTAO], nome: 'Pessoa PRESIDENCIA_GESTAO' },
    });

    const opened = (await open(Perfil.NUCLEO_PEDAGOGICO).expect(200)).body as DocumentBody;
    expect(opened.sha256).toBe((sent.body as DocumentBody).sha256);
    expect(new Date(opened.expiraEm ?? 0).getTime()).toBeGreaterThan(Date.now());

    const file = await server()
      .get(linkPath(opened.url ?? ''))
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(file.headers['content-type']).toContain('application/pdf');
    expect(file.headers['content-disposition']).toContain("filename*=UTF-8''Termo%20de%20Fomento");
    expect(Buffer.compare(file.body as Buffer, PDF)).toBe(0);

    expect(
      await prisma.trilhaAuditoria.findFirstOrThrow({
        where: { acao: 'INSTRUMENT_DOCUMENT_ATTACHED' },
      }),
    ).toMatchObject({
      usuarioId: ids[Perfil.PRESIDENCIA_GESTAO],
      entidadeId: instrumentoId,
      depois: { nomeArquivo: 'Termo de Fomento nº 12.pdf', tamanho: PDF.length },
    });
  });

  it('aceita DOCX pelo conteudo e recusa outro formato mesmo com extensao de PDF', async () => {
    const sent = await upload(Perfil.PRESIDENCIA_GESTAO, docx(), 'termo.docx').expect(200);
    expect((sent.body as DocumentBody).tipoConteudo).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    const refused = await upload(
      Perfil.PRESIDENCIA_GESTAO,
      Buffer.from('texto qualquer'),
      'termo.pdf',
    ).expect(415);
    expect(refused.body as ErrorBody).toMatchObject({ code: 'INVALID_DOCUMENT_TYPE' });
    expect(await prisma.documentoInstrumento.count()).toBe(1);
  });

  it('recusa arquivo acima de 20 MB e envio sem arquivo', async () => {
    const big = Buffer.concat([PDF, Buffer.alloc(20 * 1024 * 1024)]);
    const tooLarge = await upload(Perfil.PRESIDENCIA_GESTAO, big, 'grande.pdf').expect(413);
    expect(tooLarge.body as ErrorBody).toMatchObject({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'O arquivo passa do tamanho máximo permitido.',
    });

    const missing = await server()
      .put(`/v1/instruments/${instrumentoId}/document`)
      .set('Authorization', `Bearer ${tokens[Perfil.PRESIDENCIA_GESTAO]}`)
      .field('nada', 'x')
      .expect(400);
    expect((missing.body as ErrorBody).code).toBe('DOCUMENT_REQUIRED');
    expect(await prisma.documentoInstrumento.count()).toBe(0);
  });

  it('substituir guarda o anterior e registra os dois arquivos na trilha', async () => {
    const first = (await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'termo.pdf').expect(200))
      .body as DocumentBody;
    const second = (
      await upload(Perfil.PRESIDENCIA_GESTAO, PDF_NOVO, 'termo-assinado.pdf').expect(200)
    ).body as DocumentBody;

    const opened = (await open(Perfil.PRESIDENCIA_GESTAO).expect(200)).body as DocumentBody;
    expect(opened.nomeArquivo).toBe('termo-assinado.pdf');
    expect(await prisma.documentoInstrumento.count({ where: { instrumentoId } })).toBe(2);
    expect(
      await prisma.trilhaAuditoria.findFirstOrThrow({
        where: { acao: 'INSTRUMENT_DOCUMENT_REPLACED' },
      }),
    ).toMatchObject({
      antes: { nomeArquivo: 'termo.pdf', tamanho: PDF.length, sha256: first.sha256 },
      depois: {
        nomeArquivo: 'termo-assinado.pdf',
        tamanho: PDF_NOVO.length,
        sha256: second.sha256,
      },
    });
  });

  it('so a Presidencia e Gestao anexa; quem nao consulta o instrumento nao abre', async () => {
    for (const perfil of [
      Perfil.NUCLEO_PEDAGOGICO,
      Perfil.ADMINISTRATIVO_FINANCEIRO,
      Perfil.CONCEDENTE_AUDITORIA,
      Perfil.ADMINISTRACAO_SISTEMA,
    ]) {
      await upload(perfil, PDF, 'termo.pdf').expect(403);
    }
    await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'termo.pdf').expect(200);

    for (const perfil of [Perfil.CONCEDENTE_AUDITORIA, Perfil.ADMINISTRACAO_SISTEMA]) {
      const refused = await open(perfil).expect(403);
      expect(refused.body).not.toHaveProperty('url');
    }
    await open(Perfil.ADMINISTRATIVO_FINANCEIRO).expect(200);
  });

  it('sem documento, instrumento inexistente ou inativo e link adulterado', async () => {
    const none = await open(Perfil.PRESIDENCIA_GESTAO).expect(404);
    expect((none.body as ErrorBody).code).toBe('DOCUMENT_NOT_ATTACHED');
    await open(Perfil.PRESIDENCIA_GESTAO, MISSING).expect(404);
    await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'termo.pdf', MISSING).expect(404);

    await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'termo.pdf').expect(200);
    const url = ((await open(Perfil.PRESIDENCIA_GESTAO).expect(200)).body as DocumentBody).url;
    const [path, signature] = linkPath(url ?? '').split('.');
    await server()
      .get(`${path}.${signature.slice(1)}x`)
      .expect(404);

    await prisma.instrumento.update({ where: { id: instrumentoId }, data: { ativo: false } });
    const inactive = await upload(Perfil.PRESIDENCIA_GESTAO, PDF, 'termo.pdf').expect(409);
    expect((inactive.body as ErrorBody).code).toBe('INSTRUMENT_INACTIVE');
    await open(Perfil.PRESIDENCIA_GESTAO).expect(200);
  });
});
