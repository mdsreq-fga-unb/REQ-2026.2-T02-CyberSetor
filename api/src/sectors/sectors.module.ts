import { Module } from '@nestjs/common';
import { SectorsController } from './sectors.controller.js';
import { SectorsService } from './sectors.service.js';

@Module({
  controllers: [SectorsController],
  providers: [SectorsService],
})
export class SectorsModule {}
