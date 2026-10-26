import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
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
  ChangeSituationDto,
  CreateGoalDto,
  EligibleOwnerResponse,
  GoalResponse,
  GoalResultResponse,
  RecordResultDto,
  UpdateGoalDto,
} from './goals.dto.js';
import { GoalsService } from './goals.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('goals')
@ApiBearerAuth()
@Controller()
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get('projects/:projectId/goals')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [GoalResponse] })
  list(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<GoalResponse[]> {
    return this.goals.list(projectId);
  }

  @Post('projects/:projectId/goals')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: GoalResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, INVALID_PERIOD, GOAL_REQUIREMENT_REQUIRED ou REQUIREMENT_OUTSIDE_INSTRUMENT',
  })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: CreateGoalDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoalResponse> {
    return this.goals.create(projectId, body, actorOf(user, res));
  }

  @Get('goals/eligible-owners')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({
    type: [EligibleOwnerResponse],
    description:
      'Contas ativas de Presidência e Gestão, Núcleo Pedagógico e Administrativo-Financeiro, com o setor',
  })
  eligibleOwners(): Promise<EligibleOwnerResponse[]> {
    return this.goals.eligibleOwners();
  }

  @Patch('goals/:id/situation')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: GoalResponse })
  @ApiForbiddenResponse({
    description: 'NOT_GOAL_OWNER: nem Presidência e Gestão, nem responsável',
  })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT ou INSTRUMENT_INACTIVE' })
  changeSituation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeSituationDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoalResponse> {
    return this.goals.changeSituation(id, body, actorOf(user, res), user.perfil);
  }

  @Get('goals/:id/results')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [GoalResultResponse], description: 'Do mais recente ao mais antigo' })
  listResults(@Param('id', ParseUUIDPipe) id: string): Promise<GoalResultResponse[]> {
    return this.goals.listResults(id);
  }

  @Post('goals/:id/results')
  @Profiles(...INSTRUMENT_READERS)
  @ApiCreatedResponse({ type: GoalResultResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, FUTURE_REFERENCE_DATE, GOAL_DRAFT, RESULT_VALUE_REQUIRED ou RESULT_REACH_REQUIRED',
  })
  @ApiForbiddenResponse({
    description: 'NOT_GOAL_OWNER: nem Presidência e Gestão, nem responsável',
  })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  recordResult(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RecordResultDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoalResultResponse> {
    return this.goals.recordResult(id, body, actorOf(user, res), user.perfil);
  }

  @Patch('goals/:id')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiOkResponse({ type: GoalResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, INVALID_PERIOD, INVALID_PLANNED_VALUE, GOAL_REQUIREMENT_REQUIRED ou REQUIREMENT_OUTSIDE_INSTRUMENT',
  })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT ou INSTRUMENT_INACTIVE' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGoalDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoalResponse> {
    return this.goals.update(id, body, actorOf(user, res));
  }
}
