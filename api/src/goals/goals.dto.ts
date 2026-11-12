import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import { SectorRefResponse } from '../sectors/sectors.dto.js';
import { COMPLETION_FIELDS, type CompletionField } from './goal-completion.js';
import { DEADLINE_ALERTS, type DeadlineAlert } from './goal-deadline.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class CreateGoalDto {
  @ApiProperty({ enum: OrigemMeta })
  @IsEnum(OrigemMeta)
  origem!: OrigemMeta;

  @ApiProperty({ example: 'Promover a formação artística de jovens do Setor Comercial Sul' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  objetivo!: string;

  @ApiProperty({ example: 'Realizar oficinas de dança com 120 participantes' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descricao!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Requisitos do instrumento do projeto atendidos pela meta',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  requisitoIds?: string[];

  @ApiPropertyOptional({ nullable: true, example: 'Participantes com frequência mínima de 70%' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  indicador?: string | null;

  @ApiPropertyOptional({ enum: ModalidadeAfericao, nullable: true })
  @IsOptional()
  @IsEnum(ModalidadeAfericao)
  modalidadeAfericao?: ModalidadeAfericao | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '120',
    description: 'Na meta quantitativa, número maior que zero, com até duas casas decimais',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  parametroPlanejado?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'participantes' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  unidade?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-05', format: 'date' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'periodoInicio deve estar no formato AAAA-MM-DD' })
  periodoInicio?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '2026-06-30',
    format: 'date',
    description: 'Prazo da meta',
  })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'periodoFim deve estar no formato AAAA-MM-DD' })
  periodoFim?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Mensal' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  frequenciaApuracao?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Listas de presença e relatório fotográfico' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  formaComprovacao?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Jovens certificados em dança contemporânea' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  resultadoEsperado?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Conta ativa de Presidência e Gestão, Núcleo Pedagógico ou Administrativo-Financeiro',
  })
  @IsOptional()
  @IsUUID()
  responsavelId?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Setor executor, entre os ativos' })
  @IsOptional()
  @IsUUID()
  setorId?: string | null;
}

export class UpdateGoalDto extends PartialType(CreateGoalDto, { skipNullProperties: false }) {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;
}

export class ChangeSituationDto {
  @ApiProperty({ description: 'Versão lida; mudança sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiProperty({ enum: SituacaoMeta })
  @IsEnum(SituacaoMeta)
  situacao!: SituacaoMeta;

  @ApiPropertyOptional({
    description: 'Obrigatória para reabrir meta concluída (RN-13); fica na trilha',
    example: 'Oficina remarcada pela escola parceira; a meta volta a ser acompanhada.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  justificativa?: string;
}

export class RecordResultDto {
  @ApiProperty({
    format: 'date',
    example: '2026-06-30',
    description: 'Até quando o resultado vale',
  })
  @Matches(ISO_DATE, { message: 'dataReferencia deve estar no formato AAAA-MM-DD' })
  dataReferencia!: string;

  @ApiProperty({ example: '84 jovens concluíram as oficinas com frequência mínima de 70%.' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descricao!: string;

  @ApiPropertyOptional({
    example: 84,
    description: 'Obrigatório na meta quantitativa, na unidade do parâmetro planejado',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999_999_999_999)
  valorAlcancado?: number;

  @ApiPropertyOptional({
    enum: AlcanceMeta,
    description: 'Obrigatório na meta qualitativa; na quantitativa é calculado pelo percentual',
  })
  @IsOptional()
  @IsEnum(AlcanceMeta)
  alcance?: AlcanceMeta;
}

export class GoalResultAuthorResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class GoalResultResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ format: 'date' })
  dataReferencia!: string;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ type: Number, nullable: true })
  valorAlcancado!: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Parâmetro planejado no registro' })
  parametroPlanejado!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Calculado; ausente na meta qualitativa',
  })
  percentual!: number | null;

  @ApiProperty({ enum: AlcanceMeta })
  alcance!: AlcanceMeta;

  @ApiProperty({ type: GoalResultAuthorResponse })
  registradoPor!: GoalResultAuthorResponse;

  @ApiProperty({ format: 'date-time' })
  registradoEm!: string;
}

export class GoalOwnerResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ description: 'Conta desativada deixa a meta à espera de novo responsável' })
  ativo!: boolean;
}

export class GoalSectorResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  ativo!: boolean;
}

export class EligibleOwnerResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ type: SectorRefResponse, nullable: true })
  setor!: SectorRefResponse | null;
}

export class GoalRequirementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  referencia!: string | null;

  @ApiProperty()
  descricao!: string;
}

export class GoalResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  projetoId!: string;

  @ApiProperty({ description: 'Número da meta no projeto, na ordem de cadastro' })
  ordem!: number;

  @ApiProperty({ enum: OrigemMeta })
  origem!: OrigemMeta;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ type: String, nullable: true })
  indicador!: string | null;

  @ApiProperty({ enum: ModalidadeAfericao, nullable: true })
  modalidadeAfericao!: ModalidadeAfericao | null;

  @ApiProperty({ type: String, nullable: true })
  parametroPlanejado!: string | null;

  @ApiProperty({ type: String, nullable: true })
  unidade!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date' })
  periodoInicio!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date', description: 'Prazo da meta' })
  periodoFim!: string | null;

  @ApiProperty({ type: String, nullable: true })
  frequenciaApuracao!: string | null;

  @ApiProperty({ type: String, nullable: true })
  formaComprovacao!: string | null;

  @ApiProperty({ type: String, nullable: true })
  resultadoEsperado!: string | null;

  @ApiProperty({ type: [GoalRequirementResponse] })
  requisitos!: GoalRequirementResponse[];

  @ApiProperty({
    description: 'Meta sem indicador, forma de comprovação ou período não entra na apuração',
  })
  rascunho!: boolean;

  @ApiProperty({ enum: COMPLETION_FIELDS, isArray: true })
  camposFaltantes!: CompletionField[];

  @ApiProperty({ type: GoalOwnerResponse, nullable: true })
  responsavel!: GoalOwnerResponse | null;

  @ApiProperty({ type: GoalSectorResponse, nullable: true })
  setor!: GoalSectorResponse | null;

  @ApiProperty({ enum: SituacaoMeta })
  situacao!: SituacaoMeta;

  @ApiProperty({
    enum: DEADLINE_ALERTS,
    nullable: true,
    description:
      'Prazo nos próximos 30 dias ou vencido, para meta não concluída (data de Brasília)',
  })
  alertaPrazo!: DeadlineAlert | null;

  @ApiProperty({
    type: GoalResultResponse,
    nullable: true,
    description: 'Último resultado alcançado registrado (RF43)',
  })
  resultado!: GoalResultResponse | null;
}
