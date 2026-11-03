import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module.js';
import { ReportPdfRenderer } from './pdf/report-pdf.renderer.js';
import { ReportPdfService } from './report-pdf.service.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [ProjectsModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportPdfService, ReportPdfRenderer],
})
export class ReportsModule {}
