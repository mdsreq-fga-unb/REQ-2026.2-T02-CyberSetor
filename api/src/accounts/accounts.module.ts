import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { BootstrapAdminService } from './bootstrap-admin.service.js';
import { PasswordService } from './password.service.js';

@Module({
  controllers: [AccountsController],
  providers: [PasswordService, BootstrapAdminService, AccountsService],
  exports: [PasswordService],
})
export class AccountsModule {}
