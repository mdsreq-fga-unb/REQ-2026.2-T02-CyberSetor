import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageDriver, type EnvironmentVariables } from '../config/env.validation.js';
import { FILE_STORAGE, type FileStorage } from './file-storage.js';
import { FilesController } from './files.controller.js';
import { LocalFileStorage } from './local-file-storage.js';
import { S3FileStorage } from './s3-file-storage.js';

type S3Variable =
  'S3_ENDPOINT' | 'S3_REGION' | 'S3_BUCKET' | 'S3_ACCESS_KEY_ID' | 'S3_SECRET_ACCESS_KEY';

@Global()
@Module({
  controllers: [FilesController],
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>): FileStorage => {
        if (config.get('STORAGE_DRIVER', { infer: true }) === StorageDriver.S3) {
          // A validação do ambiente já exige as cinco variáveis quando o armazenamento é S3.
          const s3 = (name: S3Variable): string => config.get(name, { infer: true }) ?? '';
          return new S3FileStorage({
            endpoint: s3('S3_ENDPOINT'),
            region: s3('S3_REGION'),
            bucket: s3('S3_BUCKET'),
            accessKeyId: s3('S3_ACCESS_KEY_ID'),
            secretAccessKey: s3('S3_SECRET_ACCESS_KEY'),
          });
        }
        return new LocalFileStorage(
          config.get('STORAGE_LOCAL_DIR', { infer: true }),
          config.get('JWT_SECRET', { infer: true }),
        );
      },
    },
  ],
  exports: [FILE_STORAGE],
})
export class StorageModule {}
