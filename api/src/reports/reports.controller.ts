import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Actor } from '../accounts/accounts.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { FinalizeReportDto, RectifyReportDto, ReportResponse } from './reports.dto.js';
import { ReportsService } from './reports.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('projects/:projectId/reports')
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [ReportResponse] })
  @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
  list(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<ReportResponse[]> {
    return this.reports.list(projectId);
  }

  @Post('projects/:projectId/report/finalize')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: ReportResponse })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, INVALID_PERIOD, INVALID_REPORT_GOAL ou JUSTIFICATION_NOT_APPLICABLE',
  })
  @ApiForbiddenResponse({ description: 'Apenas Presidência e Gestão pode emitir relatório' })
  @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
  @ApiConflictResponse({ description: 'REPORT_ALREADY_FINALIZED ou INSTRUMENT_INACTIVE' })
  @ApiUnprocessableEntityResponse({
    description: 'REPORT_FINALIZATION_BLOCKED com details.pendencias',
  })
  finalize(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: FinalizeReportDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ReportResponse> {
    return this.reports.finalize(projectId, body, actorOf(user, res));
  }

  @Post('projects/:projectId/report/:reportId/rectify')
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: ReportResponse })
  @ApiBadRequestResponse({
    description: 'Campo inválido, INVALID_REPORT_GOAL ou JUSTIFICATION_NOT_APPLICABLE',
  })
  @ApiForbiddenResponse({ description: 'Apenas Presidência e Gestão pode retificar relatório' })
  @ApiNotFoundResponse({ description: 'Relatório não encontrado' })
  @ApiConflictResponse({ description: 'REPORT_NOT_LATEST_VERSION ou INSTRUMENT_INACTIVE' })
  @ApiUnprocessableEntityResponse({
    description: 'REPORT_FINALIZATION_BLOCKED com details.pendencias',
  })
  rectify(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Body() body: RectifyReportDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ReportResponse> {
    return this.reports.rectify(projectId, reportId, body, actorOf(user, res));
  }
}
