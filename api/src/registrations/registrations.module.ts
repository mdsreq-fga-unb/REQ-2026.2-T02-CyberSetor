import { Module } from '@nestjs/common';
import { RegistrationListController } from './registration-list.controller.js';
import { RegistrationListService } from './registration-list.service.js';
import { RegistrationsController } from './registrations.controller.js';
import { RegistrationsService } from './registrations.service.js';

@Module({
  controllers: [RegistrationsController, RegistrationListController],
  providers: [RegistrationsService, RegistrationListService],
})
export class RegistrationsModule {}
