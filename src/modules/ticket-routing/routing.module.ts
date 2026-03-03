import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AgentWorkloadService } from './service/agent-workload.service';
import { AgentWorkloadRepository } from './repository/agent-workload.repository';
import { AgentCreatedEventHandler } from './handlers/kafka/agent-created.handler';
import { TicketAssignmentService } from './service/ticket-assignment.service';
import { TicketModule } from '../tickets/ticket.module';
import { LeastLoadStrategy } from './strategies';
import { ASSIGNMENT_STRATEGY } from './strategies/strategy.interface';

@Module({
  imports: [DatabaseModule, TicketModule],
  controllers: [AgentCreatedEventHandler],
  providers: [
    {
      provide: ASSIGNMENT_STRATEGY,
      useClass: LeastLoadStrategy,
    },
    AgentWorkloadService,
    TicketAssignmentService,
    AgentWorkloadRepository,
  ],
  exports: [
    AgentWorkloadService,
    AgentWorkloadRepository,
    TicketAssignmentService,
  ],
})
export class RoutingModule {}
