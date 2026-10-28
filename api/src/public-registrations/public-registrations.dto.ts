import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { CampoInscricao } from '../generated/prisma/enums.js';
import { onlyDigits } from './participant-data.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE = /^\d{10,11}$/;

const digits = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? onlyDigits(value) : value;
const lowerTrim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SubmitRegistrationDto {
  @ApiProperty({ example: 'Ana Souza' })
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome!: string;

  @ApiProperty({ example: '61999998888', description: 'DDD e número; pontuação é ignorada' })
  @Transform(digits)
  @IsString()
  @Matches(PHONE, { message: 'telefone deve ter DDD e número, com 10 ou 11 dígitos' })
  telefone!: string;

  @ApiProperty({ example: '2008-05-20', format: 'date' })
  @Matches(ISO_DATE, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
  dataNascimento!: string;

  @ApiPropertyOptional({ example: 'ana@exemplo.com' })
  @IsOptional()
  @Transform(lowerTrim)
  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '529.982.247-25', description: 'Pontuação é ignorada' })
  @IsOptional()
  @Transform(digits)
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: 'Asa Sul' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bairroRegiao?: string;

  @ApiPropertyOptional({ example: 'Ensino médio completo' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  escolaridade?: string;

  @ApiProperty({ description: 'Versão do aviso de tratamento de dados apresentada no formulário' })
  @IsString()
  @IsNotEmpty()
  versaoAviso!: string;

  @ApiProperty({ description: 'Autorização opcional para receber comunicados' })
  @IsBoolean()
  autorizaComunicados!: boolean;

  @ApiProperty({ description: 'Autorização opcional de uso institucional de imagem' })
  @IsBoolean()
  autorizaImagem!: boolean;

  @ApiPropertyOptional({ description: 'Obrigatório para menor de 18 anos' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  responsavelNome?: string;

  @ApiPropertyOptional({ description: 'Obrigatório para menor de 18 anos' })
  @IsOptional()
  @Transform(digits)
  @IsString()
  @Matches(PHONE, { message: 'responsavelTelefone deve ter DDD e número, com 10 ou 11 dígitos' })
  responsavelTelefone?: string;
}

export class PublicActivityResponse {
  @ApiProperty()
  titulo!: string;

  @ApiProperty({ format: 'date' })
  data!: string;

  @ApiProperty()
  local!: string;
}

export class DataNoticeResponse {
  @ApiProperty()
  versao!: string;

  @ApiProperty()
  texto!: string;
}

export class PublicFormResponse {
  @ApiProperty({ type: PublicActivityResponse })
  atividade!: PublicActivityResponse;

  @ApiProperty({ description: 'Se o formulário aceita novas inscrições' })
  aberta!: boolean;

  @ApiProperty({
    isArray: true,
    example: ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'],
  })
  camposMinimos!: string[];

  @ApiProperty({ enum: CampoInscricao, isArray: true, description: 'Pedidos e obrigatórios' })
  camposAdicionais!: CampoInscricao[];

  @ApiProperty({ type: DataNoticeResponse })
  aviso!: DataNoticeResponse;
}

export class SubmittedRegistrationResponse {
  @ApiProperty({ example: 'CONFIRMADA' })
  situacao!: string;

  @ApiProperty({ type: PublicActivityResponse })
  atividade!: PublicActivityResponse;

  @ApiProperty({ description: 'Data e hora da inscrição' })
  inscritoEm!: string;
}
