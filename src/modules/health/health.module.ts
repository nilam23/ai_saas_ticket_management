import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HEALTH_INDICATORS } from './index';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { STSClient } from '@aws-sdk/client-sts';
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_KEY,
} from 'src/shared/utils/env-config.utils';

@Module({
  controllers: [HealthController],
  providers: [
    ...HEALTH_INDICATORS,
    {
      provide: STSClient,
      useFactory: () =>
        new STSClient({
          region: AWS_REGION,
          ...(AWS_ACCESS_KEY && AWS_SECRET_KEY
            ? {
                credentials: {
                  accessKeyId: AWS_ACCESS_KEY,
                  secretAccessKey: AWS_SECRET_KEY,
                },
              }
            : {}),
        }),
    },
  ],
  imports: [TerminusModule, DatabaseModule],
})
export class HealthModule {}
