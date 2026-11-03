import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '../common/trim.js';
import { CampoDuplicidade, CampoInscricao, SituacaoInscricao } from '../generated/prisma/enums.js';
import { toDigits, toLowerTrim, toPhoneDigits } from '../public-registrations/participant-data.js';

/** Campos que todo formulário pede (seção 8.5.4); não são configuráveis. */
export const CAMPOS_MINIMOS = ['NOME', 'TELEFONE', 'DATA_NASCIMENTO', 'CONSENTIMENTOS'] as const;

const MAX_VAGAS = 10_000;
const MAX_TERMO = 4000;
const MAX_APRESENTACAO = 2000;
const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE = /^\d{10,11}$/;
const HOUR = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    default: true,
    description:
      'Com as vagas preenchidas, novas inscrições entram na lista de espera; false recusa o envio',
  })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  listaEspera?: boolean;

  @ApiPropertyOptional({
    default: true,
    description:
      'Com mais vagas, a lista de espera é confirmada pela ordem de chegada; false deixa ao Núcleo',
  })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  promocaoAutomatica?: boolean;

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

  @ApiPropertyOptional({
    example: '18:00',
    description: 'Hora opcional do prazo; sem ela, a inscrição encerra ao fim do dia',
  })
  @ValidateIf(filled)
  @Matches(HOUR, { message: 'prazoHora deve ser uma hora HH:MM' })
  prazoHora?: string;

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

  @ApiPropertyOptional({
    description:
      'Com as vagas preenchidas, novas inscrições entram na lista de espera; false recusa o envio',
  })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  listaEspera?: boolean;

  @ApiPropertyOptional({
    description:
      'Com mais vagas, a lista de espera é confirmada pela ordem de chegada; false deixa ao Núcleo',
  })
  @ValidateIf((_obj, value) => value !== undefined)
  @IsBoolean()
  promocaoAutomatica?: boolean;

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

  @ApiPropertyOptional({
    nullable: true,
    example: '18:00',
    description: 'null volta ao fim do dia',
  })
  @ValidateIf(filled)
  @Matches(HOUR, { message: 'prazoHora deve ser uma hora HH:MM' })
  prazoHora?: string | null;

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

  @ApiProperty({
    description:
      'Com as vagas preenchidas, novas inscrições entram na lista de espera; false recusa o envio',
  })
  listaEspera!: boolean;

  @ApiProperty({
    description:
      'Com mais vagas, a lista de espera é confirmada pela ordem de chegada; false deixa ao Núcleo',
  })
  promocaoAutomatica!: boolean;

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

  @ApiProperty({
    nullable: true,
    example: '18:00',
    description: 'Hora do prazo; null = fim do dia',
  })
  prazoHora!: string | null;

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

const notReused = (obj: CreateAssistedRegistrationDto): boolean => !obj.reaproveitarParticipanteId;
const notReusedWithEmail = (obj: CreateAssistedRegistrationDto): boolean =>
  !obj.reaproveitarParticipanteId && obj.email !== undefined;
const notReusedWithCpf = (obj: CreateAssistedRegistrationDto): boolean =>
  !obj.reaproveitarParticipanteId && obj.cpf !== undefined;
const notReusedWithBairro = (obj: CreateAssistedRegistrationDto): boolean =>
  !obj.reaproveitarParticipanteId && obj.bairroRegiao !== undefined;
const notReusedWithEscolaridade = (obj: CreateAssistedRegistrationDto): boolean =>
  !obj.reaproveitarParticipanteId && obj.escolaridade !== undefined;

export class CreateAssistedRegistrationDto {
  @ApiPropertyOptional({
    description:
      'ID do participante existente, caso o operador opte por reaproveitar o cadastro (CA-08.3, RF22)',
  })
  @IsOptional()
  @IsUUID()
  reaproveitarParticipanteId?: string;

  @ApiPropertyOptional({ example: 'Ana Souza' })
  @ValidateIf(notReused)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ example: '61999998888', description: 'DDD e número' })
  @ValidateIf(notReused)
  @Transform(toPhoneDigits)
  @IsString()
  @Matches(PHONE, { message: 'telefone deve ter DDD e número, com 10 ou 11 dígitos' })
  telefone?: string;

  @ApiPropertyOptional({ example: '2008-05-20', format: 'date' })
  @ValidateIf(notReused)
  @Matches(ISO_DATE, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
  dataNascimento?: string;

  @ApiPropertyOptional({ example: 'ana@exemplo.com' })
  @ValidateIf(notReusedWithEmail)
  @Transform(toLowerTrim)
  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '529.982.247-25' })
  @ValidateIf(notReusedWithCpf)
  @Transform(toDigits)
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: 'Asa Sul' })
  @ValidateIf(notReusedWithBairro)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bairroRegiao?: string;

  @ApiPropertyOptional({ example: 'Ensino médio completo' })
  @ValidateIf(notReusedWithEscolaridade)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  escolaridade?: string;

  @ApiProperty({ description: 'Versão do aviso de tratamento de dados apresentada' })
  @IsString()
  @IsNotEmpty()
  versaoAviso!: string;

  @ApiProperty({ description: 'Autorização opcional para comunicados' })
  @IsBoolean()
  autorizaComunicados!: boolean;

  @ApiProperty({ description: 'Autorização opcional de uso institucional de imagem e voz' })
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
  @Transform(toPhoneDigits)
  @IsString()
  @Matches(PHONE, { message: 'responsavelTelefone deve ter DDD e número, com 10 ou 11 dígitos' })
  responsavelTelefone?: string;
}

export class AssistedRegistrationParticipantSummary {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class AssistedRegistrationResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SituacaoInscricao })
  situacao!: SituacaoInscricao;

  @ApiPropertyOptional({ nullable: true })
  posicaoEspera?: number | null;

  @ApiProperty()
  reaproveitouParticipante!: boolean;

  @ApiProperty({ type: AssistedRegistrationParticipantSummary })
  participante!: AssistedRegistrationParticipantSummary;

  @ApiProperty()
  inscritoEm!: string;
}
