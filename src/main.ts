import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  useGlobalApiPrefix,
  useListen,
  useMicroservice,
  useValidation,
} from './shared/utils/app.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useMicroservice(app);
  await app.startAllMicroservices();
  useValidation(app);
  useGlobalApiPrefix(app);
  await useListen(app);
}

void bootstrap();
