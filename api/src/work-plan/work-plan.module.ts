import { Module } from '@nestjs/common';
import { WorkPlanController } from './work-plan.controller.js';
import { WorkPlanService } from './work-plan.service.js';

@Module({
  controllers: [WorkPlanController],
  providers: [WorkPlanService],
})
export class WorkPlanModule {}
