import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Res } from '@nestjs/common';
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
  CreateRequirementDto,
  RequirementResponse,
  UpdateRequirementDto,
} from './requirements.dto.js';
import { RequirementsService } from './requirements.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('requirements')
@ApiBearerAuth()
@Controller()
export class RequirementsController {
  constructor(private readonly requirements: RequirementsService) {}

  @Get('instruments/:instrumentId/requirements')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [RequirementResponse] })
  list(@Param('instrumentId', ParseUUIDPipe) instrumentId: string): Promise<RequirementResponse[]> {
    return this.requirements.list(instrumentId);
  }

  @Post('instruments/:instrumentId/requirements')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: RequirementResponse })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  create(
    @Param('instrumentId', ParseUUIDPipe) instrumentId: string,
    @Body() body: CreateRequirementDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RequirementResponse> {
    return this.requirements.create(instrumentId, body, actorOf(user, res));
  }

  @Patch('requirements/:id')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({ type: RequirementResponse })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT ou INSTRUMENT_INACTIVE' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRequirementDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RequirementResponse> {
    return this.requirements.update(id, body, actorOf(user, res));
  }
}
