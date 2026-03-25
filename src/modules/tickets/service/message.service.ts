import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import {
  CreateMessageInput,
  UpdateMessageFilterQuery,
  UpdateMessageUpdateQuery,
  UpdateMessageInput,
  FindMessageByIdInput,
  FetchMessagesInput,
  FetchMessagesOutput,
} from '../types/message.type';
import { Message } from '@prisma/client';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly auditService: AuditService,
  ) {}

  public async createMessage(
    createMessageInput: CreateMessageInput,
    auditContext?: AuditContext,
  ): Promise<Message> {
    this.logger.debug(
      `Creating message. Ticket ID: ${createMessageInput.ticketId}`,
    );
    const createdMessage =
      await this.messageRepository.createMessage(createMessageInput);
    this.logger.debug(
      `Message created. Message ID: ${createdMessage.id}, Ticket ID: ${createMessageInput.ticketId}`,
    );

    if (auditContext) {
      await this.auditService.createAuditLog({
        tenantId: auditContext.tenantId!,
        actorUserId: createMessageInput.senderId!,
        action: AuditLogAction.CREATE_MESSAGE,
        entityId: createdMessage.id,
        entityType: AuditLogEntityType.MESSAGE,
        afterState: {
          messageId: createdMessage.id,
          createdBy: createdMessage.senderId,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }

    return createdMessage;
  }

  public async updateMessage(
    updateTicketInput: UpdateMessageInput,
  ): Promise<Message> {
    const { ticketId, messageId, content, aiResponseStatus } =
      updateTicketInput;

    this.logger.debug(
      `Updating message. MessageID: ${messageId}, TicketID: ${ticketId}`,
    );
    const filterQuery: UpdateMessageFilterQuery = { id: messageId, ticketId };
    const updateQuery: UpdateMessageUpdateQuery = {
      ...(content && { content }),
      aiResponseStatus,
      updatedAt: new Date(),
    };
    const updatedMessage = await this.messageRepository.updateMessage(
      filterQuery,
      updateQuery,
    );
    this.logger.debug(
      `Message updated. MessageID: ${messageId}, TicketID: ${ticketId}`,
    );

    return updatedMessage;
  }

  public async findMessageById(
    findMessageByIdInput: FindMessageByIdInput,
  ): Promise<Message | null> {
    const { ticketId, messageId } = findMessageByIdInput;
    this.logger.debug(
      `Fetching message. MessageID: ${messageId}, TicketID: ${ticketId}`,
    );
    return this.messageRepository.findMessageById(findMessageByIdInput);
  }

  public async fetchMessages(
    fetchMessagesInput: FetchMessagesInput,
  ): Promise<FetchMessagesOutput[]> {
    const { tenantId, ticketId, userId } = fetchMessagesInput;
    this.logger.debug(
      `Fetching messages. TicketID: ${ticketId}, UserID: ${userId}, TenantID: ${tenantId}`,
    );
    return this.messageRepository.fetchMessages(fetchMessagesInput);
  }
}
