import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { trimString } from '../common/trim.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateGoalNoticeDto {
  @ApiProperty({ format: 'date', example: '2026-12-01', description: 'Quando o aviso é enviado' })
  @Matches(ISO_DATE, { message: 'dataAviso deve estar no formato AAAA-MM-DD' })
  dataAviso!: string;

  @ApiProperty({
    example: 'Conferir a lista de frequência antes do fechamento.',
    description: 'Vai no e-mail: não inclua dados de participantes',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  mensagem!: string;
}

export class GoalNoticeResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ format: 'date' })
  dataAviso!: string;

  @ApiProperty()
  mensagem!: string;

  @ApiProperty()
  criadoPor!: string;

  @ApiProperty({ format: 'date-time' })
  criadoEm!: string;
}
