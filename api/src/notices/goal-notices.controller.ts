import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { CreateGoalNoticeDto, GoalNoticeResponse } from './goal-notices.dto.js';
import { GoalNoticesService } from './goal-notices.service.js';

function actorOf(user: ValidSession, res: Response) {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals/:id/notices')
export class GoalNoticesController {
  constructor(private readonly notices: GoalNoticesService) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: [GoalNoticeResponse] })
  list(@Param('id', ParseUUIDPipe) id: string): Promise<GoalNoticeResponse[]> {
    return this.notices.list(id);
  }

  @Post()
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiCreatedResponse({ type: GoalNoticeResponse })
  @ApiBadRequestResponse({ description: 'Campo inválido ou PAST_NOTICE_DATE' })
  @ApiConflictResponse({ description: 'INSTRUMENT_INACTIVE' })
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateGoalNoticeDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoalNoticeResponse> {
    return this.notices.create(id, body, actorOf(user, res));
  }

  @Delete(':noticeId')
  @HttpCode(204)
  @Profiles(Perfil.PRESIDENCIA_GESTAO)
  @ApiNoContentResponse()
  @ApiConflictResponse({ description: 'NOTICE_ALREADY_DUE' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('noticeId', ParseUUIDPipe) noticeId: string,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.notices.remove(id, noticeId, actorOf(user, res));
  }
}
