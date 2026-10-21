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
  CreateModalityDto,
  ListModalitiesQuery,
  ModalityResponse,
  UpdateModalityDto,
} from './modalities.dto.js';
import { ModalitiesService } from './modalities.service.js';

// HU-03a: o coordenador pedagógico cadastra as modalidades; a gestão também, por organizar a execução.
const WRITERS = [Perfil.NUCLEO_PEDAGOGICO, Perfil.PRESIDENCIA_GESTAO];
const READERS = [...WRITERS, Perfil.ADMINISTRATIVO_FINANCEIRO];

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('modalities')
@ApiBearerAuth()
@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalities: ModalitiesService) {}

  @Get()
  @Profiles(...READERS)
  @ApiOkResponse({ type: [ModalityResponse] })
  list(@Query() query: ListModalitiesQuery): Promise<ModalityResponse[]> {
    return this.modalities.list(query.ativo);
  }

  @Get(':id')
  @Profiles(...READERS)
  @ApiOkResponse({ type: ModalityResponse })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ModalityResponse> {
    return this.modalities.get(id);
  }

  @Post()
  @Profiles(...WRITERS)
  @ApiCreatedResponse({ type: ModalityResponse })
  @ApiConflictResponse({ description: 'Já existe modalidade com este nome' })
  create(
    @Body() body: CreateModalityDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ModalityResponse> {
    return this.modalities.create(body, actorOf(user, res));
  }

  @Patch(':id')
  @Profiles(...WRITERS)
  @ApiOkResponse({ type: ModalityResponse })
  @ApiConflictResponse({ description: 'Nome repetido ou versão desatualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateModalityDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ModalityResponse> {
    return this.modalities.update(id, body, actorOf(user, res));
  }
}
