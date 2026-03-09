import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AgentWorkloadService } from './service/agent-workload.service';
import { AgentWorkloadRepository } from './repository/agent-workload.repository';
import { AgentCreatedEventHandler } from './handlers/kafka/agent-created-event.handler';
import { TicketAssignmentService } from './service/ticket-assignment.service';
import { TicketModule } from '../tickets/ticket.module';
import { LeastLoadStrategy } from './strategies';
import { ASSIGNMENT_STRATEGY } from './strategies/strategy.interface';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { TicketClassifiedEventHandler } from './handlers/kafka/ticket-classified-event.handler';
import { AgentSkillMapService } from './service/agent-skill-map.service';
import { AgentSkillMapRepository } from './repository/agent-skill-map.repository';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    forwardRef(() => TicketModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AgentCreatedEventHandler, TicketClassifiedEventHandler],
  providers: [
    {
      provide: ASSIGNMENT_STRATEGY,
      useClass: LeastLoadStrategy,
    },
    AgentWorkloadService,
    TicketAssignmentService,
    AgentWorkloadRepository,
    AgentSkillMapService,
    AgentSkillMapRepository,
  ],
  exports: [
    AgentWorkloadService,
    AgentWorkloadRepository,
    TicketAssignmentService,
  ],
})
export class RoutingModule {}
