import { Module } from '@nestjs/common';
import { InstrumentsController } from './instruments.controller.js';
import { InstrumentDocumentsService } from './instrument-documents.service.js';
import { InstrumentsService } from './instruments.service.js';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentDocumentsService],
})
export class InstrumentsModule {}
