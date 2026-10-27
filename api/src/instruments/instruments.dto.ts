import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../common/trim.js';
import { TipoInstrumento } from '../generated/prisma/enums.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONEY = /^\d{1,12}(\.\d{1,2})?$/;

export class CreateInstrumentDto {
  @ApiProperty({ enum: TipoInstrumento })
  @IsEnum(TipoInstrumento)
  tipo!: TipoInstrumento;

  @ApiProperty({ example: 'Secretaria de Cultura e Economia Criativa do DF' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  orgaoConcedente!: string;

  @ApiProperty({ example: '00150-00001234/2026-11' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  numeroProcesso!: string;

  @ApiProperty({ example: '150000.00', description: 'Reais, com até duas casas decimais' })
  @IsString()
  @Matches(MONEY, { message: 'valorGlobal deve ser um valor em reais, ex.: 150000.00' })
  valorGlobal!: string;

  @ApiProperty({ example: '2026-03-10', format: 'date' })
  @Matches(ISO_DATE, { message: 'dataCelebracao deve estar no formato AAAA-MM-DD' })
  dataCelebracao!: string;

  @ApiProperty({ example: '2026-04-01', format: 'date' })
  @Matches(ISO_DATE, { message: 'vigenciaInicio deve estar no formato AAAA-MM-DD' })
  vigenciaInicio!: string;

  @ApiProperty({ example: '2027-03-31', format: 'date' })
  @Matches(ISO_DATE, { message: 'vigenciaFim deve estar no formato AAAA-MM-DD' })
  vigenciaFim!: string;
}

export class UpdateInstrumentDto extends PartialType(CreateInstrumentDto, {
  skipNullProperties: false,
}) {
  @ApiProperty({ description: 'Versão lida; edição sobre versão antiga é recusada com 409' })
  @IsInt()
  @Min(1)
  versao!: number;
}

export class ListInstrumentsQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ obj }: { obj: Record<string, unknown> }) => {
    const raw = obj.ativo;
    return raw === 'true' ? true : raw === 'false' ? false : raw;
  })
  @IsBoolean()
  ativo?: boolean;
}

export class InstrumentResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versao!: number;

  @ApiProperty({ enum: TipoInstrumento })
  tipo!: TipoInstrumento;

  @ApiProperty()
  orgaoConcedente!: string;

  @ApiProperty()
  numeroProcesso!: string;

  @ApiProperty({ example: '150000.00' })
  valorGlobal!: string;

  @ApiProperty({ format: 'date' })
  dataCelebracao!: string;

  @ApiProperty({ format: 'date' })
  vigenciaInicio!: string;

  @ApiProperty({ format: 'date' })
  vigenciaFim!: string;

  @ApiProperty()
  ativo!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Envio do documento formal vigente; nulo sem documento',
  })
  documentoFormalEm!: string | null;
}

export class SavedInstrumentResponse {
  @ApiProperty({ type: InstrumentResponse })
  instrumento!: InstrumentResponse;

  @ApiProperty({ description: 'Outro instrumento já usa o mesmo número de processo' })
  numeroProcessoRepetido!: boolean;
}

export class DocumentSenderResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class InstrumentDocumentResponse {
  @ApiProperty()
  nomeArquivo!: string;

  @ApiProperty({ example: 'application/pdf' })
  tipoConteudo!: string;

  @ApiProperty({ description: 'Bytes' })
  tamanho!: number;

  @ApiProperty({ description: 'SHA-256 do conteúdo, em hexadecimal' })
  sha256!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  enviadoEm!: Date;

  @ApiProperty({ type: DocumentSenderResponse })
  enviadoPor!: DocumentSenderResponse;
}

export class OpenInstrumentDocumentResponse extends InstrumentDocumentResponse {
  @ApiProperty({ description: 'Endereço assinado de curta duração para abrir o documento' })
  url!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  expiraEm!: Date;
}
