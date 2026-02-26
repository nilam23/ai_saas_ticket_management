import { HealthCheckStatus } from '@nestjs/terminus';
import { NodeEnvironmentEnum } from 'src/shared/enums/env-config.enum';

export type HealthLivenessResponse = {
  status: HealthCheckStatus;
  timestamp: string;
  environment: NodeEnvironmentEnum;
};
