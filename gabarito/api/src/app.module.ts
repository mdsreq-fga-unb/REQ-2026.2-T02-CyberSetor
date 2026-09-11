import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequisitosDojoModule } from './requisitos-dojo/requisitos-dojo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequisitosDojoModule,
  ],
})
export class AppModule {}
