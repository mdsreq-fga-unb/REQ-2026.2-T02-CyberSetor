import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CampoDuplicidade, CampoInscricao } from '../generated/prisma/enums.js';

/** Campos que todo formulário pede (seção 8.5.4); não são configuráveis. */
export const CAMPOS_MINIMOS = ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'] as const;

const MAX_VAGAS = 10_000;

export class OpenRegistrationDto {
  @ApiProperty({ example: 30, minimum: 1, maximum: MAX_VAGAS })
  @IsInt()
  @Min(1)
  @Max(MAX_VAGAS)
  vagas!: number;

  @ApiProperty({ enum: CampoInscricao, isArray: true, example: ['EMAIL', 'CPF'] })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(CampoInscricao).length)
  @IsEnum(CampoInscricao, { each: true, message: 'campo fora da lista permitida' })
  camposAdicionais!: CampoInscricao[];

  @ApiProperty({ enum: CampoDuplicidade, description: 'Precisa estar entre os campos adicionais' })
  @IsEnum(CampoDuplicidade)
  campoDuplicidade!: CampoDuplicidade;
}

export class UpdateRegistrationDto {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ description: 'false encerra a inscrição; true reabre' })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  aberta?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_VAGAS })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(MAX_VAGAS)
  vagas?: number;

  @ApiPropertyOptional({ enum: CampoInscricao, isArray: true })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(CampoInscricao).length)
  @IsEnum(CampoInscricao, { each: true, message: 'campo fora da lista permitida' })
  camposAdicionais?: CampoInscricao[];

  @ApiPropertyOptional({ enum: CampoDuplicidade })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsEnum(CampoDuplicidade)
  campoDuplicidade?: CampoDuplicidade;
}

export class RegistrationResponse {
  @ApiProperty()
  atividadeId!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty({ description: 'Se o formulário público aceita novas inscrições' })
  aberta!: boolean;

  @ApiProperty()
  vagas!: number;

  @ApiProperty({ enum: CAMPOS_MINIMOS, isArray: true, description: 'Sempre pedidos (seção 8.5.4)' })
  camposMinimos!: (typeof CAMPOS_MINIMOS)[number][];

  @ApiProperty({ enum: CampoInscricao, isArray: true })
  camposAdicionais!: CampoInscricao[];

  @ApiProperty({ enum: CampoDuplicidade })
  campoDuplicidade!: CampoDuplicidade;

  @ApiProperty({ description: 'Código aleatório do link público, que não revela a atividade' })
  codigoPublico!: string;

  @ApiProperty({
    example: '/inscrever/q1Xr9cTz0bK3mNpA',
    description: 'Caminho do formulário público no front',
  })
  linkPublico!: string;
}
