import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import {
  ActivityResponse,
  CreateActivityDto,
  ResponsibleResponse,
  UpdateActivityDto,
} from './activities.dto.js';
import { ActivitiesService, ACTIVITY_EDITORS } from './activities.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('activities')
@ApiBearerAuth()
@Controller()
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get('projects/:projectId/activities')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [ActivityResponse] })
  list(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<ActivityResponse[]> {
    return this.activities.list(projectId);
  }

  @Post('projects/:projectId/activities')
  @Profiles(...ACTIVITY_EDITORS)
  @ApiCreatedResponse({ type: ActivityResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, OUTSIDE_PROJECT_PERIOD, INVALID_MODALITY, INVALID_RESPONSIBLE ou META_OUTSIDE_PROJECT',
  })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: CreateActivityDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ActivityResponse> {
    return this.activities.create(projectId, body, actorOf(user, res));
  }

  @Get('activities/eligible-responsibles')
  @Profiles(...ACTIVITY_EDITORS)
  @ApiOkResponse({
    type: [ResponsibleResponse],
    description: 'Contas ativas do Instituto elegíveis como responsáveis de atividade',
  })
  eligibleResponsibles(): Promise<ResponsibleResponse[]> {
    return this.activities.eligibleResponsibles();
  }

  @Get('activities/:id')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: ActivityResponse })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ActivityResponse> {
    return this.activities.get(id);
  }

  @Patch('activities/:id')
  @Profiles(...ACTIVITY_EDITORS)
  @ApiOkResponse({ type: ActivityResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, OUTSIDE_PROJECT_PERIOD, INVALID_MODALITY, INVALID_RESPONSIBLE ou META_OUTSIDE_PROJECT',
  })
  @ApiConflictResponse({
    description: 'VERSION_CONFLICT ou INSTRUMENT_INACTIVE',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateActivityDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ActivityResponse> {
    return this.activities.update(id, body, actorOf(user, res));
  }
}
