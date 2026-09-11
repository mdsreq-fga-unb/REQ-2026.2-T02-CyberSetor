import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RequisitosDojoController } from './requisitos-dojo.controller';
import { RequisitosDojoService } from './requisitos-dojo.service';

@Module({
  controllers: [RequisitosDojoController],
  providers: [RequisitosDojoService, PrismaService],
})
export class RequisitosDojoModule {}
