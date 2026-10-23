import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { Perfil } from '../generated/prisma/enums.js';
import { SectorRefResponse } from '../sectors/sectors.dto.js';

export class CreateAccountDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome!: string;

  @ApiProperty({ example: 'pessoa@instituto.org.br' })
  @Transform(trimString)
  @IsEmail()
  @MaxLength(254)
  emailLogin!: string;

  @ApiProperty({ enum: Perfil })
  @IsEnum(Perfil)
  perfil!: Perfil;

  @ApiPropertyOptional({ description: 'Setor ativo em que a pessoa está lotada' })
  @IsOptional()
  @IsUUID()
  setorId?: string;
}

export class ChangeSectorDto {
  @ApiProperty({ type: String, nullable: true, description: 'null tira a pessoa do setor' })
  @ValidateIf((_obj, value) => value !== null)
  @IsUUID()
  setorId!: string | null;
}

export class ChangeProfileDto {
  @ApiProperty({ enum: Perfil })
  @IsEnum(Perfil)
  perfil!: Perfil;
}

export class AccountResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  pessoaId!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  emailLogin!: string;

  @ApiProperty({ enum: Perfil })
  perfil!: Perfil;

  @ApiProperty()
  ativo!: boolean;

  @ApiProperty({ type: SectorRefResponse, nullable: true })
  setor!: SectorRefResponse | null;

  @ApiProperty()
  deveTrocarSenha!: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  bloqueadoAte!: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  ultimoAcessoEm!: Date | null;
}

export class TemporaryPasswordResponse {
  @ApiProperty({ type: AccountResponse })
  conta!: AccountResponse;

  @ApiProperty({ description: 'Exibida uma unica vez; a troca e obrigatoria no primeiro acesso' })
  senhaTemporaria!: string;
}

export class DeactivationResponse {
  @ApiProperty({ type: AccountResponse })
  conta!: AccountResponse;

  @ApiProperty({ description: 'Projetos coordenados pela conta, a reatribuir' })
  projetosCoordenados!: number;
}
