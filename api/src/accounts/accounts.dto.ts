import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { trimString } from '../common/trim.js';
import { Perfil } from '../generated/prisma/enums.js';

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
