import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../accounts/password.service.js';
import { trimString } from '../common/trim.js';
import { Perfil } from '../generated/prisma/enums.js';
import { SectorRefResponse } from '../sectors/sectors.dto.js';

export class LoginDto {
  @ApiProperty({ example: 'pessoa@instituto.org.br' })
  @Transform(trimString)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  senha!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  senhaAtual!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  novaSenha!: string;
}

export class AccessResponse {
  @ApiProperty({ description: 'JWT de acesso; enviar em Authorization: Bearer' })
  accessToken!: string;

  @ApiProperty({ enum: Perfil })
  perfil!: Perfil;

  @ApiProperty()
  deveTrocarSenha!: boolean;
}

export class SessionResponse {
  @ApiProperty()
  usuarioId!: string;

  @ApiProperty({ type: SectorRefResponse, nullable: true, description: 'Setor da pessoa logada' })
  setor!: SectorRefResponse | null;

  @ApiProperty({ enum: Perfil })
  perfil!: Perfil;

  @ApiProperty()
  deveTrocarSenha!: boolean;
}
