import { Injectable, Logger } from '@nestjs/common';
import {
  CreateTicketInput,
  FindTicketByIdInput,
  UpdateTicketFilterQuery,
  UpdateTicketInput,
  UpdateTicketUpdateQuery,
} from '../types/ticket.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { TicketRepository } from '../repository/ticket.repository';
import { MessageRepository } from '../repository/message.repository';
import { SenderType, Ticket } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import { TicketNotFoundException } from '../exceptions/ticket-service.exception';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly messageRepository: MessageRepository,
    private readonly auditService: AuditService,
    private readonly kafkaProducer: KafkaProducer,
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

    const event = new TicketCreatedEvent({
      tenantId: createdTicket.tenantId,
      ticketId: createdTicket.id,
      subject: createTicketInput.subject,
      message: createTicketInput.message,
    });
    this.logger.log(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${event.name}, Event ID: ${event.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, event);
  }

  public async findTicketById(
    findTicketByIdInput: FindTicketByIdInput,
  ): Promise<Ticket> {
    this.logger.log(`Fetching ticket with ID: ${findTicketByIdInput.ticketId}`);
    const ticket =
      await this.ticketRepository.findTicketById(findTicketByIdInput);

    if (!ticket) {
      this.logger.error(
        `Ticket with ID: ${findTicketByIdInput.ticketId} not found`,
      );
      throw new TicketNotFoundException(findTicketByIdInput.ticketId);
    }

    this.logger.log(
      `Ticket with ID: ${findTicketByIdInput.ticketId} fetched successfully`,
    );
    return ticket;
  }

  public async updateTicket(
    updateTicketInput: UpdateTicketInput,
  ): Promise<Ticket> {
    this.logger.log(`Updating ticket with ID: ${updateTicketInput.ticketId}`);

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

    this.logger.log(
      `Data to be udpated for ticket ${updateTicketInput.ticketId}: ${JSON.stringify(updateQuery)}`,
    );

    const updatedTicket = await this.ticketRepository.updateTicket(
      filterQuery,
      updateQuery,
    );

    this.logger.log(`Ticket with ID: ${updateTicketInput.ticketId} updated`);

    return updatedTicket;
  }
}
