import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequisitoDojoDto } from './dto/create-requisito-dojo.dto';

@Injectable()
export class RequisitosDojoService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.requisitoDojo.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  }

  criar(dto: CreateRequisitoDojoDto) {
    return this.prisma.requisitoDojo.create({ data: dto });
  }
}