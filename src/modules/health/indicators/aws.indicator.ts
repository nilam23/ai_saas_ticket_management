import { Injectable, Logger } from '@nestjs/common';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { normalizeError } from 'src/shared/utils/error.utils';

@Injectable()
export class AwsHealthIndicator {
  private readonly logger = new Logger(AwsHealthIndicator.name);

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly stsClient: STSClient,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.stsClient.send(new GetCallerIdentityCommand({}));
      return indicator.up();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(`AWS health check failed: ${message}`);
      return indicator.down({ message });
    }
  }
}
