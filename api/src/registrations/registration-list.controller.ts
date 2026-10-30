import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import {
  CancelRegistrationDto,
  ListRegistrationsQuery,
  RegistrationListResponse,
} from './registration-list.dto.js';
import { RegistrationListService } from './registration-list.service.js';

/** Dados nominais: só o Núcleo Pedagógico; os demais perfis veem os totais na atividade (RNF04). */
@ApiTags('registrations')
@ApiBearerAuth()
@Controller('activities/:id/registrations')
@Profiles(Perfil.NUCLEO_PEDAGOGICO)
export class RegistrationListController {
  constructor(private readonly registrations: RegistrationListService) {}

  @Get()
  @ApiOkResponse({ type: RegistrationListResponse })
  @ApiNotFoundResponse({ description: 'Atividade inexistente ou REGISTRATION_NOT_OPENED' })
  list(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListRegistrationsQuery,
  ): Promise<RegistrationListResponse> {
    return this.registrations.list(id, query.busca);
  }

  /** Cancelamento ou desistência registrado pelo Núcleo; a vaga liberada anda a espera. */
  @Post(':inscricaoId/cancellation')
  @HttpCode(200)
  @ApiOkResponse({ type: RegistrationListResponse, description: 'A lista atualizada' })
  @ApiBadRequestResponse({ description: 'INVALID_REQUEST_DATE ou canal fora da lista' })
  @ApiNotFoundResponse({ description: 'Atividade ou inscrição inexistente' })
  @ApiConflictResponse({ description: 'ALREADY_CANCELLED ou INSTRUMENT_INACTIVE' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('inscricaoId', ParseUUIDPipe) inscricaoId: string,
    @Body() body: CancelRegistrationDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegistrationListResponse> {
    return this.registrations.cancel(id, inscricaoId, body, {
      usuarioId: user.usuarioId,
      correlationId: String(res.locals.correlationId ?? ''),
    });
  }

  /** Promoção manual: confirma a vaga de quem está na espera, se houver vaga livre. */
  @Post(':inscricaoId/confirmation')
  @HttpCode(200)
  @ApiOkResponse({ type: RegistrationListResponse, description: 'A lista atualizada' })
  @ApiNotFoundResponse({ description: 'Atividade ou inscrição inexistente' })
  @ApiConflictResponse({ description: 'NOT_IN_WAITLIST, NO_VACANCY ou INSTRUMENT_INACTIVE' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('inscricaoId', ParseUUIDPipe) inscricaoId: string,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegistrationListResponse> {
    return this.registrations.confirm(id, inscricaoId, {
      usuarioId: user.usuarioId,
      correlationId: String(res.locals.correlationId ?? ''),
    });
  }
}
