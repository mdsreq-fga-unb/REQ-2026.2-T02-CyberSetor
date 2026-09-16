import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRequisitoDojoDto } from './dto/create-requisito-dojo.dto';
import { RequisitosDojoService } from './requisitos-dojo.service';

@Controller('requisitos-dojo')
export class RequisitosDojoController {
  constructor(private readonly requisitos: RequisitosDojoService) {}

  @Get()
  listar() {
    return this.requisitos.listar();
  }

  @Post()
  criar(@Body() dto: CreateRequisitoDojoDto) {
    return this.requisitos.criar(dto);
  }
}
