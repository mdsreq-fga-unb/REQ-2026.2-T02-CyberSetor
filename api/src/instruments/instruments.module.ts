import { Module } from '@nestjs/common';
import { InstrumentsController } from './instruments.controller.js';
import { InstrumentsService } from './instruments.service.js';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
})
export class InstrumentsModule {}
