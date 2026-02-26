import { EnvVariablesType } from '../types/env-config.type';
import { ConfigService } from '@nestjs/config';
import { EnvConfigEnum, NodeEnvironmentEnum } from '../enums/env-config.enum';

const configService = new ConfigService<EnvVariablesType, true>();
export const NODE_ENV = configService.get<NodeEnvironmentEnum>(
  EnvConfigEnum.NODE_ENV,
);
export const APP_PORT = configService.get<number>(EnvConfigEnum.APP_PORT);
export const DATABASE_URL = configService.get<string>(
  EnvConfigEnum.DATABASE_URL,
);
export const JWT_SECRET = configService.get<string>(EnvConfigEnum.JWT_SECRET);
export const USER_DEFAULT_PASSWORD = configService.get<string>(
  EnvConfigEnum.USER_DEFAULT_PASSWORD,
);
