import { Injectable, Logger } from '@nestjs/common';
import { TicketService } from 'src/modules/tickets/service/ticket.service';
import {
  AgentLevel,
  AgentSkill,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import { AgentWorkloadService } from 'src/modules/user/service/agent-workload.service';
import { AgentRoutingRepository } from 'src/modules/user/repository/agent-routing.repository';
import { AssignTicketInput } from '../types/ticket-assignment.type';
import { CLASSIFICATION_CONFIDENCE_THRESHOLD } from '../constants/ticket.constants';

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
    const { tenantId, ticketId } = assignTicketInput;

    this.logger.debug(
      `Assigning ticket. TicketID: ${ticketId}, TenantID: ${tenantId}`,
    );

    const ticket = await this.ticketService.findTicketById(assignTicketInput);

    if (ticket.assignedToId) {
      this.logger.error(
        `Ticket is already assigned. TicketID: ${ticketId}, AgentID: ${ticket.assignedToId}`,
      );
      return;
    }

    this.logger.debug(`Picking the best agent. TicketID: ${ticketId}`);

    const requiredLevel = this.getRequiredAgentLevel(ticket.priority);
    const requiredSkill =
      ticket.category &&
      ticket.aiConfidence !== null &&
      ticket.aiConfidence > CLASSIFICATION_CONFIDENCE_THRESHOLD
        ? (ticket.category as AgentSkill)
        : AgentSkill.GENERAL;

    const pickedAgentResult = await this.agentRoutingRepository.pickAgent({
      tenantId,
      skill: requiredSkill,
      level: requiredLevel,
    });

    if (!pickedAgentResult) {
      this.logger.error(`No available agent found. TicketID: ${ticketId}`);
      return;
    }

    this.logger.debug(
      `Agent picked. AgentID: ${pickedAgentResult.agentId}, TicketID: ${ticketId}`,
    );

    const systemUser = await this.userService.getUserData({
      tenantId,
      email: getTenantSystemUserEmail(tenantId),
    });

    this.logger.debug(`System user fetched. TenantID: ${tenantId}`);

    await Promise.all([
      this.ticketService.updateTicket({
        ticketId,
        tenantId,
        assignedToId: pickedAgentResult.agentId,
        status: TicketStatus.IN_PROGRESS,
      }),
      this.agentWorkloadService.updateAgentWorkload({
        agentId: pickedAgentResult.agentId,
        tenantId,
        delta: 1,
      }),
      this.auditService.createAuditLog({
        tenantId,
        actorUserId: systemUser.id,
        action: AuditLogAction.ASSIGN_TICKET,
        entityId: ticketId,
        entityType: AuditLogEntityType.TICKET,
        afterState: { assignedTo: pickedAgentResult.agentId },
      }),
    ]);

    this.logger.debug(
      `Ticket has been assigned. TicketID: ${ticketId}, AgentID: ${pickedAgentResult.agentId}, TenantID: ${tenantId}`,
    );
  }
}
