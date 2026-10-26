import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Res } from '@nestjs/common';
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
import type { Actor } from '../accounts/accounts.service.js';
import { ACTIVITY_EDITORS } from '../activities/activities.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import {
  OpenRegistrationDto,
  RegistrationResponse,
  UpdateRegistrationDto,
} from './registrations.dto.js';
import { RegistrationsService } from './registrations.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('registrations')
@ApiBearerAuth()
@Controller('activities/:id/registration')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: RegistrationResponse })
  @ApiNotFoundResponse({ description: 'Atividade inexistente ou REGISTRATION_NOT_OPENED' })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<RegistrationResponse> {
    return this.registrations.get(id);
  }

  @Post()
  @Profiles(...ACTIVITY_EDITORS)
  @ApiCreatedResponse({ type: RegistrationResponse })
  @ApiBadRequestResponse({
    description: 'Campo fora da lista permitida ou DUPLICATE_KEY_NOT_ASKED',
  })
  @ApiConflictResponse({ description: 'REGISTRATION_ALREADY_OPENED ou INSTRUMENT_INACTIVE' })
  open(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OpenRegistrationDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegistrationResponse> {
    return this.registrations.open(id, body, actorOf(user, res));
  }

  @Patch()
  @Profiles(...ACTIVITY_EDITORS)
  @ApiOkResponse({ type: RegistrationResponse })
  @ApiBadRequestResponse({
    description: 'Campo fora da lista permitida ou DUPLICATE_KEY_NOT_ASKED',
  })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT ou INSTRUMENT_INACTIVE' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRegistrationDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegistrationResponse> {
    return this.registrations.update(id, body, actorOf(user, res));
  }
}
