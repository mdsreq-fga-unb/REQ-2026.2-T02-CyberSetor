import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Profiles } from '../auth/decorators.js';
import { INSTRUMENT_READERS } from '../instruments/instruments.controller.js';
import { ProjectTimelineResponse } from './project-timeline.dto.js';
import { ProjectTimelineService } from './project-timeline.service.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('projects/:id/timeline')
export class ProjectTimelineController {
  constructor(private readonly timeline: ProjectTimelineService) {}

  /** Painel e linha do tempo do projeto (HU-02b): vigência, prazos e requisitos atendidos. */
  @Get()
  @Profiles(...INSTRUMENT_READERS)
  @ApiOkResponse({ type: ProjectTimelineResponse })
  @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ProjectTimelineResponse> {
    return this.timeline.get(id);
  }
}
