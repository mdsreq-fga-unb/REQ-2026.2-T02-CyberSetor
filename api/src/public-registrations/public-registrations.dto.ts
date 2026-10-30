import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { CampoInscricao } from '../generated/prisma/enums.js';
import { toDigits, toLowerTrim, toPhoneDigits } from './participant-data.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE = /^\d{10,11}$/;

// Campo opcional: ausente passa; enviado, inclusive null, é validado.
const sent = (_obj: object, value: unknown): boolean => value !== undefined;
// Sem conversão implícita: o texto "false" não vira autorização dada.
const asSent = ({ obj, key }: { obj: Record<string, unknown>; key: string }): unknown => obj[key];

export class SubmitRegistrationDto {
  @ApiProperty({ example: 'Ana Souza' })
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome!: string;

  @ApiPropertyOptional({ example: 'Aninha', description: 'Como a pessoa prefere ser chamada' })
  @ValidateIf(sent)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nomePreferencia?: string;

  @ApiProperty({ example: '61999998888', description: 'DDD e número; pontuação é ignorada' })
  @Transform(toPhoneDigits)
  @IsString()
  @Matches(PHONE, { message: 'telefone deve ter DDD e número, com 10 ou 11 dígitos' })
  telefone!: string;

  @ApiProperty({ example: '2008-05-20', format: 'date' })
  @Matches(ISO_DATE, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
  dataNascimento!: string;

  @ApiPropertyOptional({ example: 'ana@exemplo.com' })
  @ValidateIf(sent)
  @Transform(toLowerTrim)
  @IsEmail({}, { message: 'email inválido' })
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '529.982.247-25', description: 'Pontuação é ignorada' })
  @ValidateIf(sent)
  @Transform(toDigits)
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: 'Asa Sul' })
  @ValidateIf(sent)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bairroRegiao?: string;

  @ApiPropertyOptional({ example: 'Ensino médio completo' })
  @ValidateIf(sent)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  escolaridade?: string;

  @ApiProperty({ description: 'Versão do aviso de tratamento de dados apresentada no formulário' })
  @IsString()
  @IsNotEmpty()
  versaoAviso!: string;

  @ApiPropertyOptional({
    description: 'Versão do termo de compromisso aceito; vai só quando a pessoa marca o aceite',
  })
  @ValidateIf(sent)
  @IsString()
  @IsNotEmpty()
  versaoTermo?: string;

  @ApiProperty({ description: 'Autorização opcional para receber comunicados' })
  @Transform(asSent)
  @IsBoolean()
  autorizaComunicados!: boolean;

  @ApiProperty({ description: 'Autorização opcional de uso institucional de imagem e voz' })
  @Transform(asSent)
  @IsBoolean()
  autorizaImagem!: boolean;

  @ApiPropertyOptional({ description: 'Obrigatório para menor de 18 anos' })
  @ValidateIf(sent)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  responsavelNome?: string;

  @ApiPropertyOptional({ description: 'Obrigatório para menor de 18 anos' })
  @ValidateIf(sent)
  @Transform(toPhoneDigits)
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

export class CommitmentTermResponse {
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

  @ApiProperty({
    type: CommitmentTermResponse,
    nullable: true,
    description: 'Compromissos da turma, com aceite obrigatório; null quando a atividade não tem',
  })
  termo!: CommitmentTermResponse | null;

  @ApiProperty({
    nullable: true,
    description: 'Apresentação da atividade escrita pela coordenação',
  })
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
}

export class SubmittedRegistrationResponse {
  @ApiProperty({ example: 'CONFIRMADA' })
  situacao!: string;

  @ApiProperty({ type: PublicActivityResponse })
  atividade!: PublicActivityResponse;

  @ApiProperty({ description: 'Data e hora da inscrição' })
  inscritoEm!: string;
}
