import { Injectable, Logger } from '@nestjs/common';
import {
  CreateTicketInput,
  FetchTicketsFilterQuery,
  FetchTicketsInput,
  FindTicketByIdInput,
  UpdateTicketFilterQuery,
  UpdateTicketInput,
  UpdateTicketUpdateQuery,
} from '../types/ticket.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { TicketRepository } from '../repository/ticket.repository';
import { SenderType, Ticket, UserRole } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import { TicketNotFoundException } from '../exceptions/ticket-service.exception';
import { MessageService } from './message.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly messageService: MessageService,
    private readonly auditService: AuditService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  public async createTicket(
    createTicketInput: CreateTicketInput,
    auditContext: AuditContext,
  ) {
    this.logger.debug(
      `Creating ticket. CustomerID: ${createTicketInput.createdById}, TenantID: ${createTicketInput.tenantId}`,
    );
    const createdTicket =
      await this.ticketRepository.createTicket(createTicketInput);

    await this.messageService.createMessage({
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

    this.logger.debug(
      `Ticket created successfully. Ticket ID: ${createdTicket.id}, CustomerID: ${createTicketInput.createdById}, TenantID: ${createTicketInput.tenantId}`,
    );

    const event = new TicketCreatedEvent({
      tenantId: createdTicket.tenantId,
      ticketId: createdTicket.id,
      subject: createTicketInput.subject,
      message: createTicketInput.message,
    });
    this.logger.debug(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${event.name}, EventID: ${event.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, event);
  }

  public async findTicketById(
    findTicketByIdInput: FindTicketByIdInput,
  ): Promise<Ticket> {
    this.logger.debug(
      `Fetching ticket. TicketID: ${findTicketByIdInput.ticketId}`,
    );
    const ticket =
      await this.ticketRepository.findTicketById(findTicketByIdInput);

    if (!ticket) {
      this.logger.error(
        `Ticket not found. TicketID: ${findTicketByIdInput.ticketId}`,
      );
      throw new TicketNotFoundException(findTicketByIdInput.ticketId);
    }

    this.logger.debug(
      `Ticket fetched successfully. TicketID: ${findTicketByIdInput.ticketId}`,
    );
    return ticket;
  }

  public async updateTicket(
    updateTicketInput: UpdateTicketInput,
  ): Promise<Ticket> {
    const filterQuery: UpdateTicketFilterQuery = {
      id: updateTicketInput.ticketId,
      tenantId: updateTicketInput.tenantId,
    };
    const updateQuery: UpdateTicketUpdateQuery = {
      ...(updateTicketInput.status && { status: updateTicketInput.status }),
      ...(updateTicketInput.priority && {
        priority: updateTicketInput.priority,
      }),
      ...(updateTicketInput.category && {
        category: updateTicketInput.category,
      }),
      ...(updateTicketInput.sentiment && {
        sentiment: updateTicketInput.sentiment,
      }),
      ...(updateTicketInput.confidence && {
        aiConfidence: updateTicketInput.confidence,
      }),
      ...(updateTicketInput.assignedToId && {
        assignedTo: { connect: { id: updateTicketInput.assignedToId } },
      }),
      updatedAt: new Date(),
    };

    this.logger.debug(
      `Updating ticket. TicketID: ${updateTicketInput.ticketId}, Data: ${JSON.stringify(updateQuery)}`,
    );

    const updatedTicket = await this.ticketRepository.updateTicket(
      filterQuery,
      updateQuery,
    );

    this.logger.debug(
      `Ticket updated. TicketID: ${updateTicketInput.ticketId}`,
    );

    return updatedTicket;
  }

  public async fetchTickets(
    fetchTicketsInput: FetchTicketsInput,
  ): Promise<Ticket[]> {
    const { tenantId, userId, userRole } = fetchTicketsInput;
    const filterQuery: FetchTicketsFilterQuery = {
      tenantId,
      ...(userRole === UserRole.CUSTOMER && { createdById: userId }),
      ...(userRole === UserRole.AGENT && { assignedToId: userId }),
    };
    this.logger.debug(
      `Fetching tickets. Filter: ${JSON.stringify(filterQuery)}`,
    );
    return this.ticketRepository.fetchTickets(filterQuery);
  }
}
