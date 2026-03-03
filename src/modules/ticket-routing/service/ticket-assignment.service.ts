import { Inject, Injectable, Logger } from '@nestjs/common';
import { AssignTicketInput } from '../types/ticket-assignment.type';
import { TicketService } from 'src/modules/tickets/service/ticket.service';
import {
  ASSIGNMENT_STRATEGY,
  type AssignmentStrategy,
} from '../strategies/strategy.interface';
import { TicketStatus } from '@prisma/client';
import { AgentWorkloadService } from './agent-workload.service';

@Injectable()
export class TicketAssignmentService {
  private readonly logger = new Logger(TicketAssignmentService.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly agentWorkloadService: AgentWorkloadService,
    @Inject(ASSIGNMENT_STRATEGY)
    private readonly pickAgentStrategy: AssignmentStrategy,
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

    const selectedAgentId = this.pickAgentStrategy.select(availableAgents);

    if (!selectedAgentId) {
      this.logger.error(
        `Agent selection failed for the ticket ${assignTicketInput.ticketId}`,
      );
      return;
    }

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
    ]);

    this.logger.log(
      `Ticket ${assignTicketInput.ticketId} has been assigned to the agent ${selectedAgentId}`,
    );
  }
}
