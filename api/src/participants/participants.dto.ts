import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { SituacaoInscricao } from '../generated/prisma/enums.js';
import { toDigits, toLowerTrim, toPhoneDigits } from '../public-registrations/participant-data.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE = /^\d{10,11}$/;

// Campo obrigatório do participante: ausente mantém o valor; enviado, inclusive null, é validado.
const sent = (_obj: object, value: unknown): boolean => value !== undefined;
// Campo opcional do participante: null apaga o valor.
const filled = (_obj: object, value: unknown): boolean => value !== undefined && value !== null;

export class ListParticipantsQuery {
  @ApiPropertyOptional({
    description: 'Parte do nome, do nome de preferência, do telefone ou do e-mail',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  busca?: string;
}

export class CorrectParticipantDto {
  @ApiProperty({ description: 'Versão lida; correção sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;

  @ApiProperty({ description: 'Pedido do titular que motiva a correção (RF26, CA-15a.2)' })
  @Transform(trimString)
  @IsString()
  @MinLength(10, { message: 'Descreva o pedido do titular em pelo menos 10 caracteres.' })
  @MaxLength(1000)
  justificativa!: string;

  @ApiPropertyOptional()
  @ValidateIf(sent)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(filled)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nomePreferencia?: string | null;

  @ApiPropertyOptional({ description: 'DDD e número; pontuação e +55 são ignorados' })
  @ValidateIf(sent)
  @Transform(toPhoneDigits)
  @IsString()
  @Matches(PHONE, { message: 'telefone deve ter DDD e número, com 10 ou 11 dígitos' })
  telefone?: string;

  @ApiPropertyOptional({ format: 'date' })
  @ValidateIf(sent)
  @Matches(ISO_DATE, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
  dataNascimento?: string;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(filled)
  @Transform(toLowerTrim)
  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Pontuação é ignorada' })
  @ValidateIf(filled)
  @Transform(toDigits)
  @IsString()
  cpf?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(filled)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bairroRegiao?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(filled)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  escolaridade?: string | null;
}

export class ParticipantActivityRef {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty({ format: 'date' })
  data!: string;
}

export class ParticipantSummaryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ nullable: true })
  nomePreferencia!: string | null;

  @ApiProperty({ description: 'Idade completa hoje, em Brasília' })
  idade!: number;

  @ApiProperty()
  telefone!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty()
  inscricoes!: number;

  @ApiProperty({
    type: ParticipantActivityRef,
    nullable: true,
    description: 'Inscrição mais recente',
  })
  ultimaAtividade!: ParticipantActivityRef | null;
}

export class ParticipantRegistrationResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SituacaoInscricao })
  situacao!: SituacaoInscricao;

  @ApiProperty()
  inscritoEm!: Date;

  @ApiProperty()
  autorizaComunicados!: boolean;

  @ApiProperty()
  autorizaImagem!: boolean;

  @ApiProperty({ nullable: true, description: 'Quando aceitou os compromissos da turma' })
  termoAceitoEm!: Date | null;

  @ApiProperty({ nullable: true })
  responsavelNome!: string | null;

  @ApiProperty({ nullable: true })
  responsavelTelefone!: string | null;

  @ApiProperty({ type: ParticipantActivityRef })
  atividade!: ParticipantActivityRef;

  @ApiProperty()
  projetoId!: string;

  @ApiProperty()
  instrumentoId!: string;
}

export class ParticipantResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ nullable: true })
  nomePreferencia!: string | null;

  @ApiProperty()
  telefone!: string;

  @ApiProperty({ format: 'date' })
  dataNascimento!: string;

  @ApiProperty()
  idade!: number;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  cpf!: string | null;

  @ApiProperty({ nullable: true })
  bairroRegiao!: string | null;

  @ApiProperty({ nullable: true })
  escolaridade!: string | null;

  @ApiProperty({ type: [ParticipantRegistrationResponse] })
  inscricoes!: ParticipantRegistrationResponse[];
}
