import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { withTimeout } from '../utils/indicator.utils';
import { normalizeError } from 'src/shared/utils/error.utils';

@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);
  private readonly HEALTH_CHECK_TIMEOUT_MS = 5000;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await withTimeout(
        this.prismaService.$queryRaw`SELECT 1`,
        this.HEALTH_CHECK_TIMEOUT_MS,
        'Prisma health check timeout',
      );
      return indicator.up();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(`Database health check failed: ${message}`);
      return indicator.down({ message });
    }
  }
}
