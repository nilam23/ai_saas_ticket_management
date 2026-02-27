import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AdminController } from './admin.controller';
import { UserService } from './service/user.service';
import { GetUserDataHandler } from './handlers/get-user-data.handler';
import { UserRepository } from './repository/user.repository';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CreateUserHandler } from './handlers/create-user.handler';
import { GetTenantUsersHandler } from './handlers/get-tenant-users.handler';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), AuditModule],
  controllers: [UserController, AdminController],
  providers: [
    UserService,
    UserRepository,
    GetUserDataHandler,
    CreateUserHandler,
    GetTenantUsersHandler,
  ],
  exports: [UserService],
})
export class UserModule {}
