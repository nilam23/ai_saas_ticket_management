import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AdminController } from './admin.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { AgentCreatedEventHandler } from './handlers/kafka/agent-created-event.handler';
import { AgentWorkloadService } from './service/agent-workload.service';
import { AgentSkillMapService } from './service/agent-skill-map.service';
import { AgentSkillMapRepository } from './repository/agent-skill-map.repository';
import { AgentWorkloadRepository } from './repository/agent-workload.repository';
import { AgentRoutingRepository } from './repository/agent-routing.repository';
import { CreateAgentHandler } from './handlers/api/create-agent.handler';
import { GetUserDataHandler } from './handlers/api/get-user-data.handler';
import { GetTenantUsersHandler } from './handlers/api/get-tenant-users.handler';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    AuditModule,
    KafkaModule,
  ],
  controllers: [UserController, AdminController, AgentCreatedEventHandler],
  providers: [
    UserService,
    UserRepository,
    GetUserDataHandler,
    CreateAgentHandler,
    GetTenantUsersHandler,
    AgentWorkloadService,
    AgentWorkloadRepository,
    AgentSkillMapService,
    AgentSkillMapRepository,
    AgentRoutingRepository,
  ],
  exports: [UserService, AgentWorkloadService, AgentRoutingRepository],
})
export class UserModule {}
