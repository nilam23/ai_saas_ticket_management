import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { EnvConfigEnum } from 'src/shared/enums/env-config.enum';
import { JwtApplicationService } from './service/jwt.service';
import { UserModule } from '../user/user.module';
import { TenantModule } from '../tenants/tenant.module';
import { AuditModule } from '../audit/audit.module';
import { RegisterCustomerHandler } from './handlers/api/register-customer.handler';
import { RegisterHandler } from './handlers/api/register.handler';
import { UserSignInHandler } from './handlers/api/user-signin.handler';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(EnvConfigEnum.JWT_SECRET),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => TenantModule),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterHandler,
    UserSignInHandler,
    RegisterCustomerHandler,
    JwtApplicationService,
  ],
  exports: [JwtApplicationService],
})
export class AuthModule {}
