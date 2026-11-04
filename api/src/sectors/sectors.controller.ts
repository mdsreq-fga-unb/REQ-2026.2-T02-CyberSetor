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
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import {
  CreateSectorDto,
  ListSectorsQuery,
  SectorResponse,
  UpdateSectorDto,
} from './sectors.dto.js';
import { SectorsService } from './sectors.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('sectors')
@ApiBearerAuth()
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectors: SectorsService) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS, Perfil.ADMINISTRACAO_SISTEMA)
  @ApiOkResponse({ type: [SectorResponse] })
  list(@Query() query: ListSectorsQuery): Promise<SectorResponse[]> {
    return this.sectors.list(query.ativo);
  }

  @Post()
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: SectorResponse })
  @ApiConflictResponse({ description: 'SECTOR_NAME_TAKEN' })
  create(
    @Body() body: CreateSectorDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SectorResponse> {
    return this.sectors.create(body, actorOf(user, res));
  }

  @Patch(':id')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({ type: SectorResponse })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT ou SECTOR_NAME_TAKEN' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSectorDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SectorResponse> {
    return this.sectors.update(id, body, actorOf(user, res));
  }
}
