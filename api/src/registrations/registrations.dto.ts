import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '../common/trim.js';
import { CampoDuplicidade, CampoInscricao } from '../generated/prisma/enums.js';
import { toPhoneDigits } from '../public-registrations/participant-data.js';

/** Campos que todo formulário pede (seção 8.5.4); não são configuráveis. */
export const CAMPOS_MINIMOS = ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'] as const;

const MAX_VAGAS = 10_000;
const MAX_TERMO = 4000;
const MAX_APRESENTACAO = 2000;
const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE = /^\d{10,11}$/;

// Campo opcional que aceita null para limpar: ausente ou null passa; com valor, é validado.
const filled = (_obj: object, value: unknown): boolean => value !== undefined && value !== null;

export class OpenRegistrationDto {
  @ApiProperty({ example: 30, minimum: 1, maximum: MAX_VAGAS })
  @IsInt()
  @Min(1)
  @Max(MAX_VAGAS)
  vagas!: number;

  @ApiProperty({ enum: CampoInscricao, isArray: true, example: ['EMAIL', 'CPF'] })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(CampoInscricao).length)
  @IsEnum(CampoInscricao, { each: true, message: 'campo fora da lista permitida' })
  camposAdicionais!: CampoInscricao[];

  @ApiProperty({ enum: CampoDuplicidade, description: 'Precisa estar entre os campos adicionais' })
  @IsEnum(CampoDuplicidade)
  campoDuplicidade!: CampoDuplicidade;

  @ApiPropertyOptional({
    maxLength: MAX_TERMO,
    description: 'Compromissos da turma; com termo, o formulário exige o aceite',
  })
  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TERMO)
  termoCompromisso?: string;

  @ApiPropertyOptional({
    maxLength: MAX_APRESENTACAO,
    description: 'Apresentação da atividade na página de inscrição',
  })
  @ValidateIf(filled)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_APRESENTACAO)
  apresentacao?: string;

  @ApiPropertyOptional({
    example: '2026-11-05',
    description: 'Último dia para se inscrever, de hoje até a data da atividade',
  })
  @ValidateIf(filled)
  @Matches(ISO_DATE, { message: 'prazoInscricao deve ser uma data AAAA-MM-DD' })
  prazoInscricao?: string;

  @ApiPropertyOptional({ example: '61999998888', description: 'WhatsApp do Instituto com DDD' })
  @ValidateIf(filled)
  @Transform(toPhoneDigits)
  @Matches(PHONE, { message: 'contatoWhatsapp deve ter DDD e número, com 10 ou 11 dígitos' })
  contatoWhatsapp?: string;
}

export class UpdateRegistrationDto {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiPropertyOptional({ description: 'false encerra a inscrição; true reabre' })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  aberta?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_VAGAS })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(MAX_VAGAS)
  vagas?: number;

  @ApiPropertyOptional({ enum: CampoInscricao, isArray: true })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(CampoInscricao).length)
  @IsEnum(CampoInscricao, { each: true, message: 'campo fora da lista permitida' })
  camposAdicionais?: CampoInscricao[];

  @ApiPropertyOptional({ enum: CampoDuplicidade })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsEnum(CampoDuplicidade)
  campoDuplicidade?: CampoDuplicidade;

  @ApiPropertyOptional({ nullable: true, maxLength: MAX_TERMO, description: 'null tira o termo' })
  @ValidateIf((_obj, value) => value !== undefined && value !== null)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TERMO)
  termoCompromisso?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: MAX_APRESENTACAO, description: 'null tira' })
  @ValidateIf(filled)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_APRESENTACAO)
  apresentacao?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-11-05', description: 'null tira o prazo' })
  @ValidateIf(filled)
  @Matches(ISO_DATE, { message: 'prazoInscricao deve ser uma data AAAA-MM-DD' })
  prazoInscricao?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '61999998888', description: 'null tira' })
  @ValidateIf(filled)
  @Transform(toPhoneDigits)
  @Matches(PHONE, { message: 'contatoWhatsapp deve ter DDD e número, com 10 ou 11 dígitos' })
  contatoWhatsapp?: string | null;
}

export class RegistrationResponse {
  @ApiProperty()
  atividadeId!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty({ description: 'Se o formulário público aceita novas inscrições' })
  aberta!: boolean;

  @ApiProperty()
  vagas!: number;

  @ApiProperty({ enum: CAMPOS_MINIMOS, isArray: true, description: 'Sempre pedidos (seção 8.5.4)' })
  camposMinimos!: (typeof CAMPOS_MINIMOS)[number][];

  @ApiProperty({ enum: CampoInscricao, isArray: true })
  camposAdicionais!: CampoInscricao[];

  @ApiProperty({ enum: CampoDuplicidade })
  campoDuplicidade!: CampoDuplicidade;

  @ApiProperty({ nullable: true, description: 'Compromissos da turma' })
  termoCompromisso!: string | null;

  @ApiProperty({ nullable: true, description: 'Apresentação da atividade na página de inscrição' })
  apresentacao!: string | null;

  @ApiProperty({
    nullable: true,
    example: '2026-11-05',
    description: 'Último dia para se inscrever',
  })
  prazoInscricao!: string | null;

  @ApiProperty({ nullable: true, example: '61999998888', description: 'WhatsApp do Instituto' })
  contatoWhatsapp!: string | null;

  @ApiProperty({ description: 'Código aleatório do link público, que não revela a atividade' })
  codigoPublico!: string;

  @ApiProperty({
    example: '/inscrever/q1Xr9cTz0bK3mNpA',
    description: 'Caminho do formulário público no front',
  })
  linkPublico!: string;
}
