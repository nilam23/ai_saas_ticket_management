import { EnvConfigEnum, NodeEnvironmentEnum } from '../enums/env-config.enum';

export type EnvVariablesType = {
  [EnvConfigEnum.NODE_ENV]: NodeEnvironmentEnum;
  [EnvConfigEnum.APP_PORT]: number;
  [EnvConfigEnum.JWT_SECRET]: string;
  [EnvConfigEnum.DATABASE_URL]: string;
  [EnvConfigEnum.USER_DEFAULT_PASSWORD]: string;
};
