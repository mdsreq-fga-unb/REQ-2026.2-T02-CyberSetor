import { ApiProperty } from '@nestjs/swagger';
import { DEADLINE_ALERTS, type DeadlineAlert } from '../goals/goal-deadline.js';
import { AlcanceMeta, SituacaoMeta } from '../generated/prisma/enums.js';
import { SectorRefResponse } from '../sectors/sectors.dto.js';
import { OwnerRefResponse } from './dashboard.dto.js';
import { REQUIREMENT_SITUATIONS, type RequirementSituation } from './requirement-situation.js';

export class TimelineInstrumentResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numeroProcesso!: string;

  @ApiProperty()
  orgaoConcedente!: string;

  @ApiProperty({ format: 'date' })
  vigenciaInicio!: string;

  @ApiProperty({ format: 'date' })
  vigenciaFim!: string;

  @ApiProperty()
  ativo!: boolean;
}

export class TimelineProjectResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  codigo!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty({ format: 'date' })
  inicio!: string;

  @ApiProperty({ format: 'date' })
  fim!: string;
}

export class TimelinePendingResponse {
  @ApiProperty({ description: 'Todas as metas do projeto' })
  metas!: number;

  @ApiProperty({ description: 'Prazo nos próximos 30 dias, sem conclusão' })
  vencendo!: number;

  @ApiProperty({ description: 'Prazo passado, sem conclusão' })
  vencidas!: number;

  @ApiProperty({ description: 'Metas não concluídas sem responsável' })
  semResponsavel!: number;
}

export class TimelineGoalResponse {
  @ApiProperty()
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty({ format: 'date', nullable: true })
  periodoFim!: string | null;

  @ApiProperty({ enum: SituacaoMeta })
  situacao!: SituacaoMeta;

  @ApiProperty({ enum: DEADLINE_ALERTS, nullable: true })
  alerta!: DeadlineAlert | null;

  @ApiProperty({ type: OwnerRefResponse, nullable: true })
  responsavel!: OwnerRefResponse | null;

  @ApiProperty({ type: SectorRefResponse, nullable: true })
  setor!: SectorRefResponse | null;

  @ApiProperty({ description: 'Falta campo obrigatório: fora da apuração (RN-02)' })
  rascunho!: boolean;

  @ApiProperty({ description: 'Prazo depois do fim do projeto (CA-14.5)' })
  foraDaVigencia!: boolean;
}

export class RequirementGoalResponse {
  @ApiProperty()
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty({ enum: SituacaoMeta })
  situacao!: SituacaoMeta;

  @ApiProperty()
  rascunho!: boolean;

  @ApiProperty({ enum: AlcanceMeta, nullable: true, description: 'Do resultado mais recente' })
  alcance!: AlcanceMeta | null;

  @ApiProperty({ description: 'Pode ser outro projeto do mesmo instrumento' })
  projetoId!: string;

  @ApiProperty()
  projetoCodigo!: string;
}

export class TimelineRequirementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ nullable: true })
  referencia!: string | null;

  @ApiProperty({
    enum: REQUIREMENT_SITUATIONS,
    description:
      'ATENDIDO: ao menos uma meta vinculada, e todas concluídas, fora do rascunho e sem resultado abaixo de cumprida',
  })
  situacao!: RequirementSituation;

  @ApiProperty({ type: [RequirementGoalResponse] })
  metas!: RequirementGoalResponse[];
}

export class ProjectTimelineResponse {
  @ApiProperty({ format: 'date', description: 'Hoje em Brasília, base dos alertas' })
  hoje!: string;

  @ApiProperty({ type: TimelineInstrumentResponse })
  instrumento!: TimelineInstrumentResponse;

  @ApiProperty({ type: TimelineProjectResponse })
  projeto!: TimelineProjectResponse;

  @ApiProperty({ type: TimelinePendingResponse })
  pendencias!: TimelinePendingResponse;

  @ApiProperty({
    type: [TimelineGoalResponse],
    description: 'Do prazo mais antigo ao mais distante; sem prazo por último',
  })
  metas!: TimelineGoalResponse[];

  @ApiProperty({ type: [TimelineRequirementResponse] })
  requisitos!: TimelineRequirementResponse[];
}
