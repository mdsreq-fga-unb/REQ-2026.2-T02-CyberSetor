import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trimString } from '../common/trim.js';
import { SituacaoInscricao } from '../generated/prisma/enums.js';

export class ListRegistrationsQuery {
  @ApiPropertyOptional({ description: 'Parte do nome, do telefone ou do e-mail' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  busca?: string;
}

export class RegisteredPersonResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  participanteId!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ description: 'Idade completa hoje, em Brasília' })
  idade!: number;

  @ApiProperty({ description: 'Menor de 18 anos hoje, em Brasília' })
  menor!: boolean;

  @ApiProperty()
  telefone!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ enum: SituacaoInscricao })
  situacao!: SituacaoInscricao;

  @ApiProperty({ type: Number, nullable: true, description: 'Posição na lista de espera' })
  posicaoEspera!: number | null;

  @ApiProperty({ description: 'Data e hora da inscrição' })
  inscritoEm!: Date;

  @ApiProperty()
  autorizaComunicados!: boolean;

  @ApiProperty()
  autorizaImagem!: boolean;

  @ApiProperty({ nullable: true })
  responsavelNome!: string | null;

  @ApiProperty({ nullable: true })
  responsavelTelefone!: string | null;
}

export class RegistrationListResponse {
  @ApiProperty()
  vagas!: number;

  @ApiProperty({ description: 'Inscrições com vaga confirmada' })
  confirmadas!: number;

  @ApiProperty({ description: 'Inscrições na lista de espera' })
  emEspera!: number;

  @ApiProperty({
    type: [RegisteredPersonResponse],
    description: 'Confirmadas e depois a espera, cada grupo pela ordem de chegada; a busca filtra',
  })
  inscricoes!: RegisteredPersonResponse[];
}
