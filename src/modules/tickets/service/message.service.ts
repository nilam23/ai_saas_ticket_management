import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import {
  CreateMessageInput,
  UpdateMessageFilterQuery,
  UpdateMessageUpdateQuery,
  UpdateMessageInput,
  FindMessageByIdInput,
} from '../types/message.type';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  public async createMessage(
    createMessageInput: CreateMessageInput,
  ): Promise<Message> {
    this.logger.debug(
      `Creating message. Ticket ID: ${createMessageInput.ticketId}`,
    );
    const createdMessage =
      await this.messageRepository.createMessage(createMessageInput);
    this.logger.debug(
      `Message created. Message ID: ${createdMessage.id}, Ticket ID: ${createMessageInput.ticketId}`,
    );

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
}
