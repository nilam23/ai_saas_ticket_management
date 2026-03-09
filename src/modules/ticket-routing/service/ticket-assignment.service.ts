import { Injectable, Logger } from '@nestjs/common';
import { AssignTicketInput } from '../types/ticket-assignment.type';
import { TicketService } from 'src/modules/tickets/service/ticket.service';
import {
  AgentLevel,
  AgentSkill,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import { AgentWorkloadService } from './agent-workload.service';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import { AgentRoutingRepository } from '../repository/agent-routing.repository';

@Injectable()
export class TicketAssignmentService {
  private readonly logger = new Logger(TicketAssignmentService.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly agentWorkloadService: AgentWorkloadService,
    private readonly agentRoutingRepository: AgentRoutingRepository,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
  ) {}

  private getRequiredAgentLevel = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.HIGH:
        return AgentLevel.SENIOR;
      case TicketPriority.MEDIUM:
        return AgentLevel.MID;
      default:
        return AgentLevel.JUNIOR;
    }
  };

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

    this.logger.log(
      `Picking the best agent for the ticket ${assignTicketInput.ticketId}`,
    );
    const pickedAgentResult = await this.agentRoutingRepository.pickAgent({
      tenantId: assignTicketInput.tenantId,
      skill: AgentSkill[ticket.category!],
      requiredLevel: this.getRequiredAgentLevel(ticket.priority),
    });

    if (!pickedAgentResult) {
      this.logger.error(
        `No available agent found for the ticket ${assignTicketInput.ticketId}`,
      );
      return;
    }

    this.logger.log(
      `Agent: ${pickedAgentResult.agentId} picked for the ticket ${assignTicketInput.ticketId}`,
    );

    const systemUser = await this.userService.getUserData({
      tenantId: assignTicketInput.tenantId,
      email: getTenantSystemUserEmail(assignTicketInput.tenantId),
    });

    this.logger.log(
      `System user fetched for the tenant ${assignTicketInput.tenantId}`,
    );

    await Promise.all([
      this.ticketService.updateTicket({
        ticketId: assignTicketInput.ticketId,
        tenantId: assignTicketInput.tenantId,
        assignedToId: pickedAgentResult.agentId,
        status: TicketStatus.IN_PROGRESS,
      }),
      this.agentWorkloadService.updateAgentWorkload({
        agentId: pickedAgentResult.agentId,
        tenantId: assignTicketInput.tenantId,
        delta: 1,
      }),
      this.auditService.createAuditLog({
        tenantId: assignTicketInput.tenantId,
        actorUserId: systemUser.id,
        action: AuditLogAction.ASSIGN_TICKET,
        entityId: assignTicketInput.ticketId,
        entityType: AuditLogEntityType.TICKET,
        afterState: { assignedTo: pickedAgentResult.agentId },
      }),
    ]);

    this.logger.log(
      `Ticket ${assignTicketInput.ticketId} has been assigned to the agent ${pickedAgentResult.agentId}`,
    );
  }
}
