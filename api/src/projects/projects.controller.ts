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
import { Perfil } from '../generated/prisma/enums.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import {
  CoordinatorResponse,
  CreateProjectDto,
  ProjectResponse,
  UpdateProjectDto,
} from './projects.dto.js';
import { ProjectsService } from './projects.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('instruments/:instrumentId/projects')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [ProjectResponse] })
  list(@Param('instrumentId', ParseUUIDPipe) instrumentId: string): Promise<ProjectResponse[]> {
    return this.projects.list(instrumentId);
  }

  @Post('instruments/:instrumentId/projects')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: ProjectResponse })
  @ApiBadRequestResponse({
    description: 'Campo inválido, INVALID_SCHEDULE, OUTSIDE_INSTRUMENT_TERM ou INVALID_COORDINATOR',
  })
  @ApiConflictResponse({ description: 'PROJECT_CODE_TAKEN ou INSTRUMENT_INACTIVE' })
  create(
    @Param('instrumentId', ParseUUIDPipe) instrumentId: string,
    @Body() body: CreateProjectDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProjectResponse> {
    return this.projects.create(instrumentId, body, actorOf(user, res));
  }

  @Get('projects/eligible-coordinators')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({
    type: [CoordinatorResponse],
    description: 'Contas ativas de Presidência e Gestão ou de Núcleo Pedagógico',
  })
  eligibleCoordinators(): Promise<CoordinatorResponse[]> {
    return this.projects.eligibleCoordinators();
  }

  @Get('projects/:id')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: ProjectResponse })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ProjectResponse> {
    return this.projects.get(id);
  }

  @Patch('projects/:id')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({ type: ProjectResponse })
  @ApiConflictResponse({
    description: 'VERSION_CONFLICT, PROJECT_CODE_TAKEN ou INSTRUMENT_INACTIVE',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProjectDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProjectResponse> {
    return this.projects.update(id, body, actorOf(user, res));
  }
}
