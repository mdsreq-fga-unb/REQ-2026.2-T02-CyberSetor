import { Module } from '@nestjs/common';
import { BootstrapAdminService } from './bootstrap-admin.service.js';
import { PasswordService } from './password.service.js';

@Module({
  providers: [PasswordService, BootstrapAdminService],
  exports: [PasswordService],
})
export class AccountsModule {}
