import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NoticesService } from './notices.service.js';

@Injectable()
export class NoticesScheduler {
  private readonly logger = new Logger(NoticesScheduler.name);

  constructor(private readonly notices: NoticesService) {}

  // Uma corrida por dia: o que não saiu volta no dia seguinte, e a chave única impede repetição.
  @Cron('0 8 * * *', { name: 'avisos-de-meta', timeZone: 'America/Sao_Paulo' })
  async run(): Promise<void> {
    try {
      const { avisos } = await this.notices.runDaily();
      this.logger.log(`Corrida de avisos concluída: ${avisos} avisos avaliados`);
    } catch (error) {
      this.logger.error(`Corrida de avisos falhou: ${String(error)}`);
    }
  }
}
