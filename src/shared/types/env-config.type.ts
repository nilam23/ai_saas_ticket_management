import { EnvConfigEnum, NodeEnvironmentEnum } from '../enums/env-config.enum';

export type EnvVariablesType = {
  [EnvConfigEnum.NODE_ENV]: NodeEnvironmentEnum;
  [EnvConfigEnum.APP_PORT]: number;
  [EnvConfigEnum.JWT_SECRET]: string;
  [EnvConfigEnum.DATABASE_URL]: string;
  [EnvConfigEnum.USER_DEFAULT_PASSWORD]: string;
  [EnvConfigEnum.AWS_ACCESS_KEY]: string;
  [EnvConfigEnum.AWS_SECRET_KEY]: string;
  [EnvConfigEnum.AWS_REGION]: string;
  [EnvConfigEnum.AWS_S3_BUCKET]: string;
  [EnvConfigEnum.KAFKA_CLIENT_ID]: string;
  [EnvConfigEnum.KAFKA_GROUP_ID]: string;
  [EnvConfigEnum.KAFKA_BROKER]: string;
  [EnvConfigEnum.OLLAMA_TEXT_GENERATION_URL]: string;
  [EnvConfigEnum.OLLAMA_EMBEDDING_GENERATION_URL]: string;
  [EnvConfigEnum.OLLAMA_MODEL]: string;
};
