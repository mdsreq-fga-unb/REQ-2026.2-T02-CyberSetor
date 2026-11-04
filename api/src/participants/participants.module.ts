import { Module } from '@nestjs/common';
import { ParticipantErasureService } from './participant-erasure.service.js';
import { ParticipantsController } from './participants.controller.js';
import { ParticipantsService } from './participants.service.js';

@Module({
  controllers: [ParticipantsController],
  providers: [ParticipantsService, ParticipantErasureService],
})
export class ParticipantsModule {}
