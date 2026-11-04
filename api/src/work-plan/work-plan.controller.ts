import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { CreatePlanVersionDto, PlanVersionResponse, WorkPlanResponse } from './work-plan.dto.js';
import { WorkPlanService } from './work-plan.service.js';

@ApiTags('work-plan')
@ApiBearerAuth()
@Controller('projects/:projectId/plan-versions')
export class WorkPlanController {
  constructor(private readonly workPlan: WorkPlanService) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: WorkPlanResponse })
  @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
  get(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<WorkPlanResponse> {
    return this.workPlan.get(projectId);
  }

  /** Termo aditivo, apostila ou mudança de período por ofício (HU-14, RF31, RN-09). */
  @Post()
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: PlanVersionResponse })
  @ApiBadRequestResponse({
    description:
      'OFFICE_REQUIRES_PUBLICATION, PERIOD_REQUIRES_OFFICE, NO_GOAL_CHANGED, INVALID_PERIOD, OUTSIDE_PROJECT_EXECUTION, INVALID_PLANNED_VALUE',
  })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT, INSTRUMENT_INACTIVE' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: CreatePlanVersionDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PlanVersionResponse> {
    return this.workPlan.create(projectId, body, {
      usuarioId: user.usuarioId,
      correlationId: String(res.locals.correlationId ?? ''),
    });
  }
}
