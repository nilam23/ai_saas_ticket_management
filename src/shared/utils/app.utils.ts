import { type INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import {
  APP_PORT,
  KAFKA_BROKER,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  NODE_ENV,
} from './env-config.utils';
import { API_PREFIX } from '../constants/common.constant';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

const logger = new Logger('Bootstrap');

export const useValidation = (app: INestApplication): void => {
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
};

export const useListen = async (app: INestApplication): Promise<void> => {
  await app.listen(APP_PORT);
  logger.log(`Server is running on port ${APP_PORT} in ${NODE_ENV} mode`);
};

export const useGlobalApiPrefix = (app: INestApplication): void => {
  app.setGlobalPrefix(API_PREFIX);
};

export const useMicroservice = (app: INestApplication) => {
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: KAFKA_CLIENT_ID,
        brokers: [KAFKA_BROKER],
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
      },
      consumer: {
        groupId: KAFKA_GROUP_ID,
        sessionTimeout: 6000,
        rebalanceTimeout: 6000,
        heartbeatInterval: 2000,
      },
    },
  });
};
