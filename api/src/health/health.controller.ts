import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

export class HealthResponse {
  status!: 'ok';
  banco!: 'ok';
  uptimeSeconds!: number;
  timestamp!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ type: HealthResponse, description: 'API e banco no ar' })
  @ApiServiceUnavailableResponse({ description: 'Banco de dados indisponivel' })
  async check(): Promise<HealthResponse> {
    const bancoOk = await this.prisma.verificarConexao();
    if (!bancoOk) {
      throw new ServiceUnavailableException('Banco de dados indisponivel.');
    }
    return {
      status: 'ok',
      banco: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
