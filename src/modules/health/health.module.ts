import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HEALTH_INDICATORS } from './index';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';

@Module({
  controllers: [HealthController],
  providers: [...HEALTH_INDICATORS],
  imports: [TerminusModule, DatabaseModule],
})
export class HealthModule {}
