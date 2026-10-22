import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../common/trim.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class CreateActivityDto {
  @ApiProperty({ example: 'Oficina de música e cidadania — Turma A' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiProperty({ description: 'Modalidade ativa cadastrada pelo Instituto' })
  @IsUUID()
  modalidadeId!: string;

  @ApiProperty({ description: 'Conta ativa responsável pela atividade' })
  @IsUUID()
  responsavelId!: string;

  @ApiProperty({ example: '2026-10-28', format: 'date' })
  @Matches(ISO_DATE, { message: 'data deve estar no formato AAAA-MM-DD' })
  data!: string;

  @ApiProperty({ example: 'Galpão Cultural SCS' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  local!: string;

  @ApiProperty({
    type: [String],
    description: 'Uma ou mais metas do mesmo projeto a que a atividade contribui',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique({ message: 'metaIds deve conter elementos únicos' })
  @IsUUID('all', { each: true })
  metaIds!: string[];
}

export class UpdateActivityDto extends PartialType(CreateActivityDto, {
  skipNullProperties: false,
}) {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;
}

export class ResponsibleResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class ActivityResponsibleResponse extends ResponsibleResponse {
  @ApiProperty({ description: 'Indica se a conta do responsável permanece ativa' })
  ativo!: boolean;
}

export class ActivityModalityResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ description: 'Indica se a modalidade permanece ativa no catálogo' })
  ativo!: boolean;
}

export class ActivityMetaResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;
}

export class ActivityResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  projetoId!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty({ format: 'date' })
  data!: string;

  @ApiProperty()
  local!: string;

  @ApiProperty({ type: ActivityModalityResponse })
  modalidade!: ActivityModalityResponse;

  @ApiProperty({ type: ActivityResponsibleResponse })
  responsavel!: ActivityResponsibleResponse;

  @ApiProperty({ type: [ActivityMetaResponse] })
  metas!: ActivityMetaResponse[];
}
