import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
