import { PrismaHealthIndicator } from './prisma.indicator';
import { AwsHealthIndicator } from './aws.indicator';
import { KafkaHealthIndicator } from './kafka.indicator';

export const HEALTH_INDICATORS = [
  PrismaHealthIndicator,
  AwsHealthIndicator,
  KafkaHealthIndicator,
];
