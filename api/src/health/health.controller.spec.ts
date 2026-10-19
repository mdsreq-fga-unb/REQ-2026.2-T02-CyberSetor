import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  async function montar(bancoOk: boolean): Promise<HealthController> {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: { verificarConexao: () => Promise.resolve(bancoOk) } },
      ],
    }).compile();
    return moduleRef.get(HealthController);
  }

  it('responde ok com banco, tempo de atividade e carimbo de data ISO', async () => {
    const controller = await montar(true);

    const resposta = await controller.check();

    expect(resposta.status).toBe('ok');
    expect(resposta.banco).toBe('ok');
    expect(resposta.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(new Date(resposta.timestamp).toISOString()).toBe(resposta.timestamp);
  });

  it('responde 503 quando o banco nao responde', async () => {
    const controller = await montar(false);

    await expect(controller.check()).rejects.toMatchObject({ status: 503 });
  });
});
