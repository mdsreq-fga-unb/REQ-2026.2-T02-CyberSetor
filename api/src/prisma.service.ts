import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL não foi definida');
    }

    // Prisma 7 usa um adapter para conectar o client ao driver PostgreSQL.
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
