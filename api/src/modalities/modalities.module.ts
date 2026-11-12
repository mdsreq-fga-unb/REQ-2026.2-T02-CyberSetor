import { Module } from '@nestjs/common';
import { ModalitiesController } from './modalities.controller.js';
import { ModalitiesService } from './modalities.service.js';

@Module({
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
})
export class ModalitiesModule {}
