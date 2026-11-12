import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module.js';
import { ExportsController } from './exports.controller.js';
import { ExportsService } from './exports.service.js';

@Module({
  imports: [ProjectsModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
