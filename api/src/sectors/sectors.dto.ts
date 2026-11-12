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

export class CreateSectorDto {
  @ApiProperty({ example: 'Coordenação Pedagógica' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;
}

export class UpdateSectorDto {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ example: 'Coordenação Pedagógica' })
  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome?: string;

  @ApiPropertyOptional({ description: 'false desativa; true reativa' })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  ativo?: boolean;
}

export class ListSectorsQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ obj }: { obj: Record<string, unknown> }) => {
    const raw = obj.ativo;
    return raw === 'true' ? true : raw === 'false' ? false : raw;
  })
  @IsBoolean()
  ativo?: boolean;
}

export class SectorResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  ativo!: boolean;
}

export class SectorRefResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}
