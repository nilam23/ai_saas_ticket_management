import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { CreateMessageInput } from '../types/message.type';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  public async createMessage(createMessageInput: CreateMessageInput) {
    this.logger.log(
      `Creating message. Ticket ID: ${createMessageInput.ticketId}`,
    );
    const createdMessage =
      await this.messageRepository.createMessage(createMessageInput);
    this.logger.log(
      `Message created. Message ID: ${createdMessage.id}, Ticket ID: ${createMessageInput.ticketId}`,
    );
  }
}
