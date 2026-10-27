import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { Actor } from '../accounts/accounts.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { MAX_DOCUMENT_BYTES } from './document-type.js';
import {
  type UploadedDocument,
  InstrumentDocumentsService,
} from './instrument-documents.service.js';
import {
  CreateInstrumentDto,
  InstrumentDocumentResponse,
  InstrumentResponse,
  OpenInstrumentDocumentResponse,
  ListInstrumentsQuery,
  SavedInstrumentResponse,
  UpdateInstrumentDto,
} from './instruments.dto.js';
import { InstrumentsService } from './instruments.service.js';

export const INSTRUMENT_READERS = [
  Perfil.PRESIDENCIA_GESTAO,
  Perfil.NUCLEO_PEDAGOGICO,
  Perfil.ADMINISTRATIVO_FINANCEIRO,
];

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('instruments')
@ApiBearerAuth()
@Controller('instruments')
export class InstrumentsController {
  constructor(
    private readonly instruments: InstrumentsService,
    private readonly documents: InstrumentDocumentsService,
  ) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [InstrumentResponse] })
  list(@Query() query: ListInstrumentsQuery): Promise<InstrumentResponse[]> {
    return this.instruments.list(query.ativo);
  }

  @Get(':id')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: InstrumentResponse })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<InstrumentResponse> {
    return this.instruments.get(id);
  }

  @Post()
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: SavedInstrumentResponse })
  create(
    @Body() body: CreateInstrumentDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SavedInstrumentResponse> {
    return this.instruments.create(body, actorOf(user, res));
  }

  @Patch(':id')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({ type: SavedInstrumentResponse })
  @ApiConflictResponse({ description: 'Versão desatualizada: outra pessoa alterou o instrumento' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateInstrumentDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SavedInstrumentResponse> {
    return this.instruments.update(id, body, actorOf(user, res));
  }

  @Put(':id/document')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @UseInterceptors(
    FileInterceptor('arquivo', { limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['arquivo'],
      properties: { arquivo: { type: 'string', format: 'binary', description: 'PDF ou DOCX' } },
    },
  })
  @ApiOkResponse({ type: InstrumentDocumentResponse })
  @ApiUnsupportedMediaTypeResponse({ description: 'INVALID_DOCUMENT_TYPE' })
  @ApiPayloadTooLargeResponse({ description: 'Acima de 20 MB' })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  attachDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedDocument | undefined,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<InstrumentDocumentResponse> {
    return this.documents.attach(id, file, actorOf(user, res));
  }

  @Get(':id/document')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: OpenInstrumentDocumentResponse })
  @ApiNotFoundResponse({ description: 'DOCUMENT_NOT_ATTACHED ou instrumento inexistente' })
  openDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<OpenInstrumentDocumentResponse> {
    return this.documents.open(id, `${req.protocol}://${req.get('host')}`);
  }
}
