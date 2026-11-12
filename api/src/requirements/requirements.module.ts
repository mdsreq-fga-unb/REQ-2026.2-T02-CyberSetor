import { Module } from '@nestjs/common';
import { RequirementsController } from './requirements.controller.js';
import { RequirementsService } from './requirements.service.js';

@Module({
  controllers: [RequirementsController],
  providers: [RequirementsService],
})
export class RequirementsModule {}
