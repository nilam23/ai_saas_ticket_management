import { Injectable, Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  MicroserviceHealthIndicator,
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import {
  KAFKA_BROKER,
  KAFKA_GROUP_ID,
} from 'src/shared/utils/env-config.utils';
import { normalizeError } from 'src/shared/utils/error.utils';

@Injectable()
export class KafkaHealthIndicator extends MicroserviceHealthIndicator {
  private readonly logger = new Logger(KafkaHealthIndicator.name);

  constructor(healthIndicatorService: HealthIndicatorService) {
    super(healthIndicatorService);
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      return await this.pingCheck(key, {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [KAFKA_BROKER],
          },
          consumer: {
            groupId: KAFKA_GROUP_ID,
          },
        },
      });
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(`Kafka health check failed: ${message}`);
      throw error;
    }
  }
}
