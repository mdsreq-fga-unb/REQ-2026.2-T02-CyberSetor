import { Global, Module } from '@nestjs/common';
import { AuditTrailService } from './audit-trail.service.js';

@Global()
@Module({
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditModule {}
