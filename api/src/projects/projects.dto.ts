import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID, Matches, MaxLength, Min } from 'class-validator';
import { trimString } from '../common/trim.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class CreateProjectDto {
  @ApiProperty({ example: 'P01', description: 'Único dentro do instrumento' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo!: string;

  @ApiProperty({ example: 'Oficinas de dança no Setor Comercial Sul' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo!: string;

  @ApiProperty({ description: 'Conta ativa de Presidência e Gestão ou de Núcleo Pedagógico' })
  @IsUUID()
  coordenadorId!: string;

  @ApiProperty({ example: '2026-04-01', format: 'date' })
  @Matches(ISO_DATE, { message: 'inicio deve estar no formato AAAA-MM-DD' })
  inicio!: string;

  @ApiProperty({ example: '2026-12-31', format: 'date' })
  @Matches(ISO_DATE, { message: 'fim deve estar no formato AAAA-MM-DD' })
  fim!: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto, {
  skipNullProperties: false,
}) {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;
}

export class CoordinatorResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class ProjectCoordinatorResponse extends CoordinatorResponse {
  @ApiProperty({ description: 'Conta desativada deixa o projeto à espera de novo coordenador' })
  ativo!: boolean;
}

export class ProjectResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  instrumentoId!: string;

  @ApiProperty()
  codigo!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty({ type: ProjectCoordinatorResponse })
  coordenador!: ProjectCoordinatorResponse;

  @ApiProperty({ format: 'date' })
  inicio!: string;

  @ApiProperty({ format: 'date' })
  fim!: string;
}
