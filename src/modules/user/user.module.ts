import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AdminController } from './admin.controller';
import { UserService } from './service/user.service';
import { GetUserDataHandler } from './handlers/get-user-data.handler';
import { UserRepository } from './repository/user.repository';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GetTenantUsersHandler } from './handlers/get-tenant-users.handler';
import { AuditModule } from '../audit/audit.module';
import { RoutingModule } from '../ticket-routing/routing.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { CreateAgentHandler } from './handlers/create-agent.handler';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    AuditModule,
    KafkaModule,
    forwardRef(() => RoutingModule),
  ],
  controllers: [UserController, AdminController],
  providers: [
    UserService,
    UserRepository,
    GetUserDataHandler,
    CreateAgentHandler,
    GetTenantUsersHandler,
  ],
  exports: [UserService],
})
export class UserModule {}
