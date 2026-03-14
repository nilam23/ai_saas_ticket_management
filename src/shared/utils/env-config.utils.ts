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
export const AWS_ACCESS_KEY = configService.get<string>(
  EnvConfigEnum.AWS_ACCESS_KEY,
);
export const AWS_SECRET_KEY = configService.get<string>(
  EnvConfigEnum.AWS_SECRET_KEY,
);
export const AWS_REGION = configService.get<string>(EnvConfigEnum.AWS_REGION);
export const AWS_S3_BUCKET = configService.get<string>(
  EnvConfigEnum.AWS_S3_BUCKET,
);
export const KAFKA_CLIENT_ID = configService.get<string>(
  EnvConfigEnum.KAFKA_CLIENT_ID,
);
export const KAFKA_GROUP_ID = configService.get<string>(
  EnvConfigEnum.KAFKA_GROUP_ID,
);
export const KAFKA_BROKER = configService.get<string>(
  EnvConfigEnum.KAFKA_BROKER,
);
export const OLLAMA_TEXT_GENERATION_URL = configService.get<string>(
  EnvConfigEnum.OLLAMA_TEXT_GENERATION_URL,
);
export const OLLAMA_EMBEDDING_GENERATION_URL = configService.get<string>(
  EnvConfigEnum.OLLAMA_EMBEDDING_GENERATION_URL,
);
export const OLLAMA_TEXT_GENERATION_MODEL = configService.get<string>(
  EnvConfigEnum.OLLAMA_TEXT_GENERATION_MODEL,
);
export const OLLAMA_EMBEDDING_GENERATION_MODEL = configService.get<string>(
  EnvConfigEnum.OLLAMA_EMBEDDING_GENERATION_MODEL,
);
