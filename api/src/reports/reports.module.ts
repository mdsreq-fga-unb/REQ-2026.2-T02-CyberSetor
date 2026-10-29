import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [ProjectsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
