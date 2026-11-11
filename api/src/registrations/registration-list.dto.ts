import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { trimString } from '../common/trim.js';
import { CanalPedido, SituacaoInscricao } from '../generated/prisma/enums.js';
import type { ExistingRecord } from './existing-record.js';

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class ListRegistrationsQuery {
  @ApiPropertyOptional({ description: 'Parte do nome, do telefone ou do e-mail' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  busca?: string;
}

export class CancelRegistrationDto {
  @ApiProperty({ enum: CanalPedido, description: 'Por onde chegou o pedido de cancelamento' })
  @IsEnum(CanalPedido)
  canal!: CanalPedido;

  @ApiProperty({ format: 'date', description: 'Data do pedido; não pode ser futura' })
  @Matches(ISO_DATE, { message: 'pedidoEm deve estar no formato AAAA-MM-DD' })
  pedidoEm!: string;
}

export class CancellationResponse {
  @ApiProperty({ format: 'date' })
  pedidoEm!: string;

  @ApiProperty({ enum: CanalPedido })
  canal!: CanalPedido;
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

  @ApiProperty({ type: CancellationResponse, nullable: true })
  cancelamento!: CancellationResponse | null;

  @ApiProperty({
    enum: ['REAPROVEITADO', 'EMAIL', 'CPF'],
    nullable: true,
    description:
      'Cadastro que já existia antes desta inscrição (RF22): REAPROVEITADO quando a inscrição usa um cadastro com inscrição anterior; EMAIL ou CPF quando há outro cadastro, mais antigo, com o mesmo valor no campo que identifica cadastro repetido',
  })
  cadastroExistente!: ExistingRecord | null;
}

export class RegistrationListResponse {
  @ApiProperty()
  vagas!: number;

  @ApiProperty({ description: 'Inscrições com vaga confirmada' })
  confirmadas!: number;

  @ApiProperty({ description: 'Inscrições na lista de espera' })
  emEspera!: number;

  @ApiProperty({ description: 'Inscrições canceladas, que não ocupam vaga' })
  canceladas!: number;

  @ApiProperty({
    type: [RegisteredPersonResponse],
    description:
      'Confirmadas, espera e canceladas, cada grupo pela ordem de chegada; a busca filtra',
  })
  inscricoes!: RegisteredPersonResponse[];
}
