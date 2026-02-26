import { type INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { APP_PORT, NODE_ENV } from './env-config.utils';
import { API_PREFIX } from '../constants/common.constant';

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
