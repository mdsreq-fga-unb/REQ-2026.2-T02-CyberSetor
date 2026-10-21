import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../common/trim.js';

export class CreateModalityDto {
  @ApiProperty({ example: 'Oficina contínua' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @ApiPropertyOptional({ example: 'Turma com encontros regulares e lista de presença nominal' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  descricao?: string;
}

export class UpdateModalityDto {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ example: 'Oficina contínua' })
  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome?: string;

  @ApiPropertyOptional({ nullable: true, description: 'Texto vazio ou null apaga a descrição' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  descricao?: string | null;

  @ApiPropertyOptional({ description: 'false desativa; true reativa' })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  ativo?: boolean;
}

export class ListModalitiesQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ obj }: { obj: Record<string, unknown> }) => {
    const raw = obj.ativo;
    return raw === 'true' ? true : raw === 'false' ? false : raw;
  })
  @IsBoolean()
  ativo?: boolean;
}

export class ModalityResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ type: String, nullable: true })
  descricao!: string | null;

  @ApiProperty()
  ativo!: boolean;
}
