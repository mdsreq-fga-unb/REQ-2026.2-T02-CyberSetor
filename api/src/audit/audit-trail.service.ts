import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { AutorTipo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditEvent {
  autorTipo: AutorTipo;
  usuarioId?: string | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  antes?: Prisma.InputJsonObject;
  depois?: Prisma.InputJsonObject;
  correlationId: string;
}

@Injectable()
export class AuditTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    await tx.trilhaAuditoria.create({ data: event });
  }
}
