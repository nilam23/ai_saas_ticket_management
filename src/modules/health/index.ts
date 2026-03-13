import { PrismaHealthIndicator } from './indicators/prisma.indicator';
import { AwsHealthIndicator } from './indicators/aws.indicator';
import { KafkaHealthIndicator } from './indicators/kafka.indicator';

export const HEALTH_INDICATORS = [
  PrismaHealthIndicator,
  AwsHealthIndicator,
  KafkaHealthIndicator,
];

export { PrismaHealthIndicator, AwsHealthIndicator };
