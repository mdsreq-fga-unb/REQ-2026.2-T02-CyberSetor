import { Module } from '@nestjs/common';
import { PublicRegistrationsController } from './public-registrations.controller.js';
import { PublicRegistrationsService } from './public-registrations.service.js';

@Module({
  controllers: [PublicRegistrationsController],
  providers: [PublicRegistrationsService],
})
export class PublicRegistrationsModule {}
