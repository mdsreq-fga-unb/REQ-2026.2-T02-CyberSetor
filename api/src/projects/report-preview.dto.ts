import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import { GoalResultResponse } from '../goals/goals.dto.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class ReportPreviewQueryDto {
  @ApiProperty({
    example: '2026-01-01',
    format: 'date',
    description: 'Data inicial do período de execução (AAAA-MM-DD)',
  })
  @Matches(ISO_DATE, { message: 'from deve estar no formato AAAA-MM-DD' })
  from!: string;

  @ApiProperty({
    example: '2026-06-30',
    format: 'date',
    description: 'Data final do período de execução (AAAA-MM-DD)',
  })
  @Matches(ISO_DATE, { message: 'to deve estar no formato AAAA-MM-DD' })
  to!: string;
}

export class ReportPreviewProjectResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'P01' })
  codigo!: string;

  @ApiProperty({ example: 'Oficinas de Arte e Cidadania' })
  titulo!: string;

  @ApiProperty()
  instrumentoId!: string;

  @ApiProperty({ format: 'date' })
  inicio!: string;

  @ApiProperty({ format: 'date' })
  fim!: string;
}

export class ReportPreviewPeriodResponse {
  @ApiProperty({ format: 'date' })
  from!: string;

  @ApiProperty({ format: 'date' })
  to!: string;
}

export class ReportPreviewGoalResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'Ordem da meta no projeto (ex: 1, 2, 3...)' })
  ordem!: number;

  @ApiProperty({ enum: OrigemMeta })
  origem!: OrigemMeta;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty()
  descricao!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  indicador!: string | null;

  @ApiPropertyOptional({ enum: ModalidadeAfericao, nullable: true })
  modalidadeAfericao!: ModalidadeAfericao | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  parametroPlanejado!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  unidade!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, format: 'date' })
  periodoInicio!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, format: 'date' })
  periodoFim!: string | null;

  @ApiProperty({ enum: SituacaoMeta })
  situacao!: SituacaoMeta;

  @ApiProperty({
    description: 'Meta sem indicador, forma de comprovação ou período não entra na apuração',
  })
  rascunho!: boolean;

  @ApiPropertyOptional({
    type: GoalResultResponse,
    nullable: true,
    description: 'Último resultado alcançado registrado até o fim do período',
  })
  resultado!: GoalResultResponse | null;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Calculado; ausente na meta qualitativa',
  })
  percentual!: number | null;

  @ApiPropertyOptional({
    enum: AlcanceMeta,
    nullable: true,
    description: 'Classificação do alcance no período',
  })
  status!: AlcanceMeta | null;
}

export class ReportPreviewResponse {
  @ApiProperty({ type: ReportPreviewProjectResponse })
  projeto!: ReportPreviewProjectResponse;

  @ApiProperty({ type: ReportPreviewPeriodResponse })
  periodo!: ReportPreviewPeriodResponse;

  @ApiProperty({ type: [ReportPreviewGoalResponse] })
  metas!: ReportPreviewGoalResponse[];
}
