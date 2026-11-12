import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { ProjectTimelineController } from './project-timeline.controller.js';
import { ProjectTimelineService } from './project-timeline.service.js';

@Module({
  controllers: [DashboardController, ProjectTimelineController],
  providers: [DashboardService, ProjectTimelineService],
})
export class DashboardModule {}
