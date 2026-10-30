import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import type { Actor } from '../accounts/accounts.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import {
  CorrectParticipantDto,
  ListParticipantsQuery,
  ParticipantResponse,
  ParticipantSummaryResponse,
  RevokeAuthorizationDto,
} from './participants.dto.js';
import { ParticipantsService } from './participants.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

/** Dados nominais de participantes: só o Núcleo Pedagógico acessa as fichas (seção 8.5.1, RNF04). */
@ApiTags('participants')
@ApiBearerAuth()
@Controller('participants')
@Profiles(Perfil.NUCLEO_PEDAGOGICO)
export class ParticipantsController {
  constructor(private readonly participants: ParticipantsService) {}

  @Get()
  @ApiOkResponse({
    type: [ParticipantSummaryResponse],
    description:
      'Até 200, por nome; um 201º item avisa que a lista foi cortada e pede busca mais precisa',
  })
  list(@Query() query: ListParticipantsQuery): Promise<ParticipantSummaryResponse[]> {
    return this.participants.list(query.busca);
  }

  @Get(':id')
  @ApiOkResponse({ type: ParticipantResponse })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ParticipantResponse> {
    return this.participants.get(id);
  }

  /** Correção a pedido do titular, com justificativa (HU-15a, RF26). */
  @Patch(':id')
  @ApiOkResponse({ type: ParticipantResponse })
  @ApiBadRequestResponse({
    description: 'INVALID_CPF, INVALID_BIRTH_DATE, GUARDIAN_REQUIRED, FIELD_REQUIRED_BY_FORM',
  })
  @ApiConflictResponse({ description: 'VERSION_CONFLICT, REGISTRATION_KEY_TAKEN' })
  correct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CorrectParticipantDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ParticipantResponse> {
    return this.participants.correct(id, body, actorOf(user, res));
  }

  /** Revogação de autorização pedida pelo titular, com data e canal (CA-07a.6). */
  @Post(':id/registrations/:inscricaoId/revocations')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ParticipantResponse })
  @ApiBadRequestResponse({ description: 'Campo inválido ou INVALID_REQUEST_DATE' })
  @ApiNotFoundResponse({ description: 'Inscrição de outro participante ou inexistente' })
  @ApiConflictResponse({ description: 'AUTHORIZATION_NOT_GIVEN, ALREADY_REVOKED' })
  revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('inscricaoId', ParseUUIDPipe) inscricaoId: string,
    @Body() body: RevokeAuthorizationDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ParticipantResponse> {
    return this.participants.revoke(id, inscricaoId, body, actorOf(user, res));
  }
}
