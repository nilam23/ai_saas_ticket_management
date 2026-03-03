import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AgentWorkloadService } from './service/agent-workload.service';
import { AgentWorkloadRepository } from './repository/agent-workload.repository';
import { AgentCreatedEventHandler } from './handlers/kafka/agent-created.handler';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentCreatedEventHandler],
  providers: [AgentWorkloadService, AgentWorkloadRepository],
  exports: [AgentWorkloadService, AgentWorkloadRepository],
})
export class RoutingModule {}
