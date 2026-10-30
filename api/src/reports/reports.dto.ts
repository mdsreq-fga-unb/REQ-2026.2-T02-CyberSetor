import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { AlcanceMeta, ModalidadeAfericao, OrigemMeta } from '../generated/prisma/enums.js';
import { REPORT_PENDENCIA_MOTIVOS, type ReportPendenciaMotivo } from './report-finalization.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function metaIdKey(item: unknown): unknown {
  return typeof item === 'object' && item !== null ? (item as { metaId?: unknown }).metaId : item;
}

export class JustificativaMetaItemDto {
  @ApiProperty({ format: 'uuid', description: 'Identificador da meta apurada no relatório' })
  @IsUUID()
  metaId!: string;

  @ApiProperty({
    example: 'Atraso na liberação do espaço comunitário durante o período chuvoso.',
    maxLength: 2000,
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  texto!: string;
}

export class FinalizeReportDto {
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

  @ApiPropertyOptional({
    type: [JustificativaMetaItemDto],
    description:
      'Justificativas obrigatórias para metas parcialmente cumpridas ou não cumpridas (CA-05a.2)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique(metaIdKey, { message: 'Não repita a mesma meta na lista de justificativas' })
  @ValidateNested({ each: true })
  @Type(() => JustificativaMetaItemDto)
  justificativas?: JustificativaMetaItemDto[];
}

export class RectifyReportDto {
  @ApiProperty({
    example: 'Inclusão de comprovação complementar consolidada após fechamento do semestre.',
    maxLength: 2000,
    description: 'Motivo da retificação registrado na nova versão e na trilha de auditoria (RF39)',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  motivo!: string;

  @ApiPropertyOptional({
    type: [JustificativaMetaItemDto],
    description: 'Justificativas incluídas ou atualizadas na versão retificada',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique(metaIdKey, { message: 'Não repita a mesma meta na lista de justificativas' })
  @ValidateNested({ each: true })
  @Type(() => JustificativaMetaItemDto)
  justificativas?: JustificativaMetaItemDto[];
}

export class ReportPendenciaResponse {
  @ApiProperty({ format: 'uuid' })
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ enum: REPORT_PENDENCIA_MOTIVOS })
  motivo!: ReportPendenciaMotivo;

  @ApiPropertyOptional({ enum: AlcanceMeta, nullable: true })
  alcance!: AlcanceMeta | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  percentual!: number | null;
}

export class ReportAuthorResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class ReportGoalItemResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  metaId!: string;

  @ApiProperty({ format: 'uuid' })
  resultadoMetaId!: string;

  @ApiProperty()
  metaOrdem!: number;

  @ApiProperty({ enum: OrigemMeta })
  metaOrigem!: OrigemMeta;

  @ApiProperty()
  metaObjetivo!: string;

  @ApiProperty()
  metaDescricao!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  metaIndicador!: string | null;

  @ApiPropertyOptional({ enum: ModalidadeAfericao, nullable: true })
  modalidadeAfericao!: ModalidadeAfericao | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  unidade!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  parametroPlanejado!: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  valorAlcancado!: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  percentual!: number | null;

  @ApiProperty({ enum: AlcanceMeta })
  alcance!: AlcanceMeta;

  @ApiProperty({ format: 'date' })
  resultadoDataReferencia!: string;

  @ApiProperty()
  resultadoDescricao!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  justificativa!: string | null;
}

export class ReportResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  projetoId!: string;

  @ApiProperty({ example: 1 })
  versao!: number;

  @ApiProperty({ format: 'date', example: '2026-01-01' })
  periodoInicio!: string;

  @ApiProperty({ format: 'date', example: '2026-06-30' })
  periodoFim!: string;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  relatorioAnteriorId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  motivoRetificacao!: string | null;

  @ApiProperty({ type: ReportAuthorResponse })
  emitidoPor!: ReportAuthorResponse;

  @ApiProperty({ format: 'date-time' })
  criadoEm!: string;

  @ApiProperty({ type: [ReportGoalItemResponse] })
  metas!: ReportGoalItemResponse[];
}
