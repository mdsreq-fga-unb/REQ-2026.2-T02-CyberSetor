import { Controller, Get, Inject, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators.js';
import { contentDisposition, FILE_STORAGE, type FileStorage } from './file-storage.js';
import { LocalFileStorage } from './local-file-storage.js';

/** Entrega os arquivos do armazenamento local pelo link assinado; com S3 a rota não existe. */
@ApiExcludeController()
@Public()
@Controller('files')
export class FilesController {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  @Get(':token')
  async open(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const opened = this.storage instanceof LocalFileStorage ? await this.storage.open(token) : null;
    if (!opened) throw new NotFoundException('Link inválido ou expirado.');
    res
      .status(200)
      .type(opened.file.contentType)
      .setHeader('Content-Disposition', contentDisposition(opened.file.fileName))
      .setHeader('Cache-Control', 'private, no-store')
      .send(opened.body);
  }
}
