import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Actor } from '../accounts/accounts.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import {
  CreateInstrumentDto,
  InstrumentResponse,
  ListInstrumentsQuery,
  SavedInstrumentResponse,
  UpdateInstrumentDto,
} from './instruments.dto.js';
import { InstrumentsService } from './instruments.service.js';

const READERS = [
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
  constructor(private readonly instruments: InstrumentsService) {}

  @Get()
  @Profiles(...READERS)
  @ApiOkResponse({ type: [InstrumentResponse] })
  list(@Query() query: ListInstrumentsQuery): Promise<InstrumentResponse[]> {
    return this.instruments.list(query.ativo);
  }

  @Get(':id')
  @Profiles(...READERS)
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
}
