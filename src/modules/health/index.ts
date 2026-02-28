import { PrismaHealthIndicator } from './indicators/prisma.indicator';
import { AwsHealthIndicator } from './indicators/aws.indicator';

export const HEALTH_INDICATORS = [PrismaHealthIndicator, AwsHealthIndicator];

export { PrismaHealthIndicator, AwsHealthIndicator };
