import { Inject, Injectable, Logger } from '@nestjs/common';
import { AssignTicketInput } from '../types/ticket-assignment.type';
import { TicketService } from 'src/modules/tickets/service/ticket.service';
import {
  ASSIGNMENT_STRATEGY,
  type AssignmentStrategy,
} from '../strategies/strategy.interface';
import { TicketStatus } from '@prisma/client';
import { AgentWorkloadService } from './agent-workload.service';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';

@Injectable()
export class TicketAssignmentService {
  private readonly logger = new Logger(TicketAssignmentService.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly agentWorkloadService: AgentWorkloadService,
    @Inject(ASSIGNMENT_STRATEGY)
    private readonly pickAgentStrategy: AssignmentStrategy,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
  ) {}

  public async assignTicket(
    assignTicketInput: AssignTicketInput,
  ): Promise<void> {
    this.logger.log(
      `Assigning the ticket ${assignTicketInput.ticketId} to an agent`,
    );

    const ticket = await this.ticketService.findTicketById(assignTicketInput);

    if (ticket.assignedToId) {
      this.logger.error(
        `Ticket ${assignTicketInput.ticketId} is already assigned to ${ticket.assignedToId}`,
      );
      return;
    }

    const availableAgents = await this.agentWorkloadService.pickAgents({
      tenantId: assignTicketInput.tenantId,
    });

    if (!availableAgents.length) {
      this.logger.error(
        `No available agents found for the ticket ${assignTicketInput.ticketId}`,
      );
      return;
    }

    this.logger.log(
      `${availableAgents.length} available agents picked for the ticket ${assignTicketInput.ticketId}`,
    );

    const selectedAgentId = this.pickAgentStrategy.select(availableAgents);

    if (!selectedAgentId) {
      this.logger.error(
        `Agent selection failed for the ticket ${assignTicketInput.ticketId}`,
      );
      return;
    }

    const systemUser = await this.userService.getUserData({
      tenantId: assignTicketInput.tenantId,
      email: getTenantSystemUserEmail(assignTicketInput.tenantId),
    });

    this.logger.log(
      `System user fetched for the tenant ${assignTicketInput.tenantId}`,
    );

    await Promise.all([
      this.agentWorkloadService.updateAgentWorkload({
        agentId: selectedAgentId,
        tenantId: assignTicketInput.tenantId,
        delta: 1,
      }),
      this.ticketService.updateTicket({
        ticketId: assignTicketInput.ticketId,
        tenantId: assignTicketInput.tenantId,
        assignedToId: selectedAgentId,
        status: TicketStatus.IN_PROGRESS,
      }),
      this.auditService.createAuditLog({
        tenantId: assignTicketInput.tenantId,
        actorUserId: systemUser.id,
        action: AuditLogAction.TICKET_ASSIGNED,
        entityId: assignTicketInput.ticketId,
        entityType: AuditLogEntityType.TICKET,
        afterState: { assignedTo: selectedAgentId },
      }),
    ]);

    this.logger.log(
      `Ticket ${assignTicketInput.ticketId} has been assigned to the agent ${selectedAgentId}`,
    );
  }
}
