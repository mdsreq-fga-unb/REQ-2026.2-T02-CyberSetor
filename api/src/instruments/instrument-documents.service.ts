import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import type { Actor } from '../accounts/accounts.service.js';
import { AuditTrailService } from '../audit/audit-trail.service.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import type { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FILE_STORAGE, type FileStorage } from '../storage/file-storage.js';
import { detectDocumentType, documentFileName } from './document-type.js';
import type {
  InstrumentDocumentResponse,
  OpenInstrumentDocumentResponse,
} from './instruments.dto.js';

const DOCUMENT_SELECT = {
  chave: true,
  nomeArquivo: true,
  tipoConteudo: true,
  tamanho: true,
  sha256: true,
  enviadoEm: true,
  enviadoPor: { select: { id: true, pessoa: { select: { nome: true } } } },
} satisfies Prisma.DocumentoInstrumentoSelect;

type DocumentRow = Prisma.DocumentoInstrumentoGetPayload<{ select: typeof DOCUMENT_SELECT }>;

export interface UploadedDocument {
  originalname: string;
  buffer: Buffer;
  size: number;
}

function toResponse(row: DocumentRow): InstrumentDocumentResponse {
  return {
    nomeArquivo: row.nomeArquivo,
    tipoConteudo: row.tipoConteudo,
    tamanho: row.tamanho,
    sha256: row.sha256,
    enviadoEm: row.enviadoEm,
    enviadoPor: { id: row.enviadoPor.id, nome: row.enviadoPor.pessoa.nome },
  };
}

function trail(row: DocumentRow): Prisma.InputJsonObject {
  return { nomeArquivo: row.nomeArquivo, tamanho: row.tamanho, sha256: row.sha256 };
}

@Injectable()
export class InstrumentDocumentsService {
  private readonly urlTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditTrailService,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.urlTtlSeconds = config.get('DOCUMENT_URL_TTL_SECONDS', { infer: true });
  }

  async attach(
    instrumentoId: string,
    file: UploadedDocument | undefined,
    actor: Actor,
  ): Promise<InstrumentDocumentResponse> {
    if (!file || file.size === 0) {
      throw new BadRequestException({
        code: 'DOCUMENT_REQUIRED',
        message: 'Escolha o arquivo do documento formal.',
      });
    }
    const instrumento = await this.prisma.instrumento.findUnique({
      where: { id: instrumentoId },
      select: { ativo: true },
    });
    if (!instrumento) throw new NotFoundException('Instrumento não encontrado.');
    if (!instrumento.ativo) {
      throw new ConflictException({
        code: 'INSTRUMENT_INACTIVE',
        message: 'O instrumento está inativo e não recebe documento.',
      });
    }
    const type = detectDocumentType(file.buffer);
    if (!type) {
      throw new UnsupportedMediaTypeException({
        code: 'INVALID_DOCUMENT_TYPE',
        message: 'O documento formal precisa ser PDF ou DOCX.',
      });
    }

    const chave = `instrumentos/${instrumentoId}/${randomUUID()}.${type.extension}`;
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    await this.storage.put(chave, file.buffer, type.contentType);

    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.documentoInstrumento.findFirst({
        where: { instrumentoId },
        orderBy: [{ enviadoEm: 'desc' }, { id: 'desc' }],
        select: DOCUMENT_SELECT,
      });
      const row = await tx.documentoInstrumento.create({
        data: {
          instrumentoId,
          chave,
          nomeArquivo: documentFileName(file.originalname, type),
          tipoConteudo: type.contentType,
          tamanho: file.size,
          sha256,
          enviadoPorId: actor.usuarioId,
        },
        select: DOCUMENT_SELECT,
      });
      await this.audit.record(
        {
          autorTipo: AutorTipo.USUARIO,
          usuarioId: actor.usuarioId,
          acao: previous ? 'INSTRUMENT_DOCUMENT_REPLACED' : 'INSTRUMENT_DOCUMENT_ATTACHED',
          entidade: 'instrumento',
          entidadeId: instrumentoId,
          ...(previous ? { antes: trail(previous) } : {}),
          depois: trail(row),
          correlationId: actor.correlationId,
        },
        tx,
      );
      return toResponse(row);
    });
  }

  async open(instrumentoId: string, baseUrl: string): Promise<OpenInstrumentDocumentResponse> {
    const instrumento = await this.prisma.instrumento.count({ where: { id: instrumentoId } });
    if (instrumento === 0) throw new NotFoundException('Instrumento não encontrado.');
    const row = await this.prisma.documentoInstrumento.findFirst({
      where: { instrumentoId },
      orderBy: [{ enviadoEm: 'desc' }, { id: 'desc' }],
      select: DOCUMENT_SELECT,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_ATTACHED',
        message: 'O instrumento ainda não tem documento formal anexado.',
      });
    }
    const url = await this.storage.signedUrl(
      { key: row.chave, fileName: row.nomeArquivo, contentType: row.tipoConteudo },
      this.urlTtlSeconds,
      baseUrl,
    );
    return {
      ...toResponse(row),
      url,
      expiraEm: new Date(Date.now() + this.urlTtlSeconds * 1000),
    };
  }
}
