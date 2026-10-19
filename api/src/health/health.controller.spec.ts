import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('responde ok com tempo de atividade e carimbo de data ISO', () => {
    const resposta = controller.check();

    expect(resposta.status).toBe('ok');
    expect(resposta.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(() => new Date(resposta.timestamp).toISOString()).not.toThrow();
    expect(new Date(resposta.timestamp).toISOString()).toBe(resposta.timestamp);
  });
});
