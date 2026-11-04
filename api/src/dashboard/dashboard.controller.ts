import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { Perfil } from '../generated/prisma/enums.js';
import { DashboardResponse } from './dashboard.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /** Tela inicial: o painel de prazos (HU-02b) para quem acompanha metas e o resumo das contas para a administração. */
  @Get()
  @Profiles(...Object.values(Perfil))
  @ApiOkResponse({ type: DashboardResponse })
  get(@CurrentUser() user: ValidSession): Promise<DashboardResponse> {
    return this.dashboard.get(user.usuarioId, user.perfil);
  }
}
