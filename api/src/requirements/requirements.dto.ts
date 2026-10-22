import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../common/trim.js';

export class CreateRequirementDto {
  @ApiProperty({ example: 'Frequência mínima de 70% dos participantes nas oficinas' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descricao!: string;

  @ApiPropertyOptional({
    example: 'Termo de referência, item 24.1',
    description: 'Onde o requisito aparece no instrumento',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  referencia?: string;
}

export class UpdateRequirementDto {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ example: 'Frequência mínima de 70% dos participantes nas oficinas' })
  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descricao?: string;

  @ApiPropertyOptional({ nullable: true, description: 'Texto vazio ou null apaga a referência' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  referencia?: string | null;
}

export class RequirementResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  instrumentoId!: string;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ type: String, nullable: true })
  referencia!: string | null;
}
