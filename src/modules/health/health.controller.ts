import { Controller, Get } from '@nestjs/common';
import { type HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { NODE_ENV } from 'src/shared/utils/env-config.utils';
import { PrismaHealthIndicator } from './indicators/prisma.indicator';
import { Indicators } from './enums/indicator.enum';
import { Public } from 'src/shared/decorators/public-route.decorator';
import type { HealthLivenessResponse } from './types/api-response.type';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  @Get('readiness')
  @Public()
  async readiness(): Promise<HealthCheckResult> {
    return this.healthService.check([
      () => this.prismaHealthIndicator.isHealthy(Indicators.DATABASE),
    ]);
  }

  @Get('liveness')
  @Public()
  liveness(): HealthLivenessResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    };
  }
}
