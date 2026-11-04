import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { TipoVersaoPlano } from '../generated/prisma/enums.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MAX_METAS = 200;

const optionalDate = (_obj: object, value: unknown): boolean => value !== undefined;

/** O que muda em uma meta na nova versão; campo ausente segue como está. */
export class RepactuatedGoalDto {
  @ApiProperty()
  @IsUUID()
  metaId!: string;

  @ApiProperty({ description: 'Versão lida da meta; sobre versão antiga é recusado com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ example: '120' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  parametroPlanejado?: string;

  @ApiPropertyOptional({ format: 'date' })
  @ValidateIf(optionalDate)
  @Matches(ISO_DATE, { message: 'periodoInicio deve estar no formato AAAA-MM-DD' })
  periodoInicio?: string;

  @ApiPropertyOptional({ format: 'date' })
  @ValidateIf(optionalDate)
  @Matches(ISO_DATE, { message: 'periodoFim deve estar no formato AAAA-MM-DD' })
  periodoFim?: string;
}

export class CreatePlanVersionDto {
  @ApiProperty({ enum: TipoVersaoPlano })
  @IsEnum(TipoVersaoPlano)
  tipo!: TipoVersaoPlano;

  @ApiProperty({ format: 'date', description: 'Data do documento de origem' })
  @Matches(ISO_DATE, { message: 'dataDocumento deve estar no formato AAAA-MM-DD' })
  dataDocumento!: string;

  @ApiProperty({ description: 'Número ou referência do documento de origem (CA-14.1)' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty({ message: 'Informe o documento de origem.' })
  @MaxLength(200)
  documentoOrigem!: string;

  @ApiPropertyOptional({ description: 'Publicação do ofício; obrigatória no ofício (CA-14.4)' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  publicacao?: string;

  @ApiPropertyOptional({ description: 'Obrigatória no ofício (CA-14.4)' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  justificativa?: string;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Novo fim da vigência; obrigatório no ofício (CA-14.4)',
  })
  @ValidateIf(optionalDate)
  @Matches(ISO_DATE, { message: 'vigenciaFim deve estar no formato AAAA-MM-DD' })
  vigenciaFim?: string;

  @ApiProperty({ type: [RepactuatedGoalDto], description: 'Metas repactuadas nesta versão' })
  @IsArray()
  @ArrayMaxSize(MAX_METAS)
  @ArrayUnique((meta: RepactuatedGoalDto) => meta.metaId)
  @ValidateNested({ each: true })
  @Type(() => RepactuatedGoalDto)
  metas!: RepactuatedGoalDto[];
}

export class PlanVersionGoalResponse {
  @ApiProperty()
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty({ nullable: true })
  parametroAntes!: string | null;

  @ApiProperty({ nullable: true })
  parametroDepois!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  periodoInicioAntes!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  periodoInicioDepois!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  periodoFimAntes!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  periodoFimDepois!: string | null;
}

export class PlanAuthorResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class PlanVersionResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'A versão 1 é a pactuação original' })
  numero!: number;

  @ApiProperty({ enum: TipoVersaoPlano })
  tipo!: TipoVersaoPlano;

  @ApiProperty({ format: 'date' })
  dataDocumento!: string;

  @ApiProperty()
  documentoOrigem!: string;

  @ApiProperty({ nullable: true })
  publicacao!: string | null;

  @ApiProperty({ nullable: true })
  justificativa!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  vigenciaFimAnterior!: string | null;

  @ApiProperty({ nullable: true, format: 'date' })
  vigenciaFimNova!: string | null;

  @ApiProperty({ type: PlanAuthorResponse })
  registradoPor!: PlanAuthorResponse;

  @ApiProperty()
  criadoEm!: string;

  @ApiProperty({ type: [PlanVersionGoalResponse] })
  metas!: PlanVersionGoalResponse[];
}

/** Previsto original, reprogramado e realizado de uma meta repactuada (CA-14.3, RF44). */
export class RepactuatedComparisonResponse {
  @ApiProperty()
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty({ nullable: true })
  unidade!: string | null;

  @ApiProperty({ nullable: true })
  previstoOriginal!: string | null;

  @ApiProperty({ nullable: true })
  reprogramado!: string | null;

  @ApiProperty({ nullable: true, description: 'Valor do último resultado apurado' })
  realizado!: number | null;

  @ApiProperty({ nullable: true, format: 'date' })
  realizadoEm!: string | null;
}

export class WorkPlanResponse {
  @ApiProperty({ type: [PlanVersionResponse], description: 'Da mais recente para a mais antiga' })
  versoes!: PlanVersionResponse[];

  @ApiProperty({ type: [RepactuatedComparisonResponse] })
  repactuadas!: RepactuatedComparisonResponse[];

  @ApiProperty({
    type: [String],
    description: 'Metas com prazo depois do fim da execução, para revisão (CA-14.5)',
  })
  foraDaVigencia!: string[];
}
