import { Module } from '@nestjs/common';
import { GoalNoticesController } from './goal-notices.controller.js';
import { GoalNoticesService } from './goal-notices.service.js';
import { NoticesScheduler } from './notices.scheduler.js';
import { NoticesService } from './notices.service.js';

@Module({
  controllers: [GoalNoticesController],
  providers: [NoticesService, NoticesScheduler, GoalNoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}
