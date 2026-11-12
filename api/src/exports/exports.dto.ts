import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ReportPreviewQueryDto } from '../projects/report-preview.dto.js';
import { VISOES_METAS, type VisaoMetas } from './project-export.csv.js';

/** Formatos da planilha aberta (CA-13.1): CSV e XLSX, que abre no Excel e no Google Planilhas. */
export const FORMATOS_EXPORTACAO = ['csv', 'xlsx'] as const;
export type FormatoExportacao = (typeof FORMATOS_EXPORTACAO)[number];

export class ProjectExportQueryDto extends ReportPreviewQueryDto {
  @ApiProperty({
    enum: VISOES_METAS,
    description:
      'ANALITICA: cada resultado registrado no período. CONSOLIDADA: último resultado de cada meta até o fim do período, com resumo por alcance (CA-13.5).',
  })
  @IsIn(VISOES_METAS, { message: 'visao deve ser ANALITICA ou CONSOLIDADA' })
  visao!: VisaoMetas;

  @ApiPropertyOptional({ enum: FORMATOS_EXPORTACAO, default: 'csv' })
  @IsOptional()
  @IsIn(FORMATOS_EXPORTACAO, { message: 'formato deve ser csv ou xlsx' })
  formato?: FormatoExportacao;
}
