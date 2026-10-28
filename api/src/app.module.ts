import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.validation.js';
import { GoalsModule } from './goals/goals.module.js';
import { HealthModule } from './health/health.module.js';
import { InstrumentsModule } from './instruments/instruments.module.js';
import { ModalitiesModule } from './modalities/modalities.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { PublicRegistrationsModule } from './public-registrations/public-registrations.module.js';
import { RegistrationsModule } from './registrations/registrations.module.js';
import { RequirementsModule } from './requirements/requirements.module.js';
import { SectorsModule } from './sectors/sectors.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    StorageModule,
    HealthModule,
    AuditModule,
    AccountsModule,
    AuthModule,
    InstrumentsModule,
    ModalitiesModule,
    ProjectsModule,
    ActivitiesModule,
    RequirementsModule,
    GoalsModule,
    SectorsModule,
    RegistrationsModule,
    PublicRegistrationsModule,
  ],
})
export class AppModule {}
