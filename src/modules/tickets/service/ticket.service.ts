import { Injectable, Logger } from '@nestjs/common';
import { CreateTicketInput } from '../type/ticket.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { TicketRepository } from '../repository/ticket.repository';
import { MessageRepository } from '../repository/message.repository';
import { SenderType } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly messageRepository: MessageRepository,
    private readonly auditService: AuditService,
  ) {}

  public async createTicket(
    createTicketInput: CreateTicketInput,
    auditContext: AuditContext,
  ) {
    this.logger.log(`Creating ticket by ${createTicketInput.createdById}`);
    const createdTicket =
      await this.ticketRepository.createTicket(createTicketInput);

    await this.messageRepository.createMessage({
      ticketId: createdTicket.id,
      content: createTicketInput.message,
      senderId: createTicketInput.createdById,
      senderType: SenderType.CUSTOMER,
    });

    await this.auditService.createAuditLog({
      tenantId: createTicketInput.tenantId,
      actorUserId: createTicketInput.createdById,
      action: AuditLogAction.CREATE_TICKET,
      entityType: AuditLogEntityType.TICKET,
      entityId: createdTicket.id,
      afterState: {
        ticketId: createdTicket.id,
        createdBy: createdTicket.createdById,
        subject: createdTicket.subject,
        priority: createdTicket.priority,
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    this.logger.log(
      `Ticket successfully created by ${createTicketInput.createdById}. Ticket ID: ${createdTicket.id}`,
    );
  }
}
