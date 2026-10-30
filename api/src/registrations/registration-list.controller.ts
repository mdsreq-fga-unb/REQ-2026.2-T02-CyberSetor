import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Profiles } from '../auth/decorators.js';
import { Perfil } from '../generated/prisma/enums.js';
import { ListRegistrationsQuery, RegistrationListResponse } from './registration-list.dto.js';
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
}
