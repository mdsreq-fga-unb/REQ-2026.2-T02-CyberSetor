import { Controller, Get, Param, ParseUUIDPipe, Query, Res, StreamableFile } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Actor } from '../accounts/accounts.service.js';
import { CurrentUser } from '../auth/authenticated-user.js';
import { Profiles } from '../auth/decorators.js';
import type { ValidSession } from '../auth/session.service.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { ProjectExportQueryDto } from './exports.dto.js';
import { ExportsService } from './exports.service.js';

function actorOf(user: ValidSession, res: Response): Actor {
  return { usuarioId: user.usuarioId, correlationId: String(res.locals.correlationId ?? '') };
}

@ApiTags('exports')
@ApiBearerAuth()
@Controller('projects/:projectId/export')
export class ExportsController {
  constructor(private readonly service: ExportsService) {}

  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description:
      'Planilha CSV (UTF-8, separada por ponto e vírgula) com legenda, data de corte, metas na visão escolhida e atividades do período (RF38)',
  })
  @ApiBadRequestResponse({
    description: 'INVALID_PERIOD, data inválida, visão ou formato inválido',
  })
  @ApiForbiddenResponse({ description: 'Perfil sem consulta aos projetos (seção 8.5.1)' })
  @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
  async exportProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectExportQueryDto,
    @CurrentUser() user: ValidSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.service.exportProject(projectId, query, actorOf(user, res));
    return new StreamableFile(file.content, {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${file.fileName}"`,
      length: file.content.length,
    });
  }
}
