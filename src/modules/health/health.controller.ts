import { Controller, Get, Logger } from '@nestjs/common';
import { type HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { NODE_ENV } from 'src/shared/utils/env-config.utils';
import { PrismaHealthIndicator } from './indicators/prisma.indicator';
import { Indicators } from './enums/indicator.enum';
import { Public } from 'src/shared/decorators/public-route.decorator';
import type { HealthLivenessResponse } from './types/api-response.type';
import { AwsHealthIndicator } from './indicators/aws.indicator';
import { KafkaHealthIndicator } from './indicators/kafka.indicator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly healthService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly awsHealthIndicator: AwsHealthIndicator,
    private readonly kafkaHealthIndicator: KafkaHealthIndicator,
  ) {}

  @Get('readiness')
  @Public()
  async readiness(): Promise<HealthCheckResult> {
    this.logger.log('Checking health readiness');
    return this.healthService.check([
      () => this.prismaHealthIndicator.isHealthy(Indicators.DATABASE),
      () => this.awsHealthIndicator.isHealthy(Indicators.AWS),
      () => this.kafkaHealthIndicator.isHealthy(Indicators.KAFKA),
    ]);
  }

  @Get('liveness')
  @Public()
  liveness(): HealthLivenessResponse {
    this.logger.log('Checking health liveness');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    };
  }
}
