import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '../accounts/password.service.js';
import { trimString } from '../common/trim.js';
import { Perfil } from '../generated/prisma/enums.js';

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

  @ApiProperty({ enum: Perfil })
  perfil!: Perfil;

  @ApiProperty()
  deveTrocarSenha!: boolean;
}
