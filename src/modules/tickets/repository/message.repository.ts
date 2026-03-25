import { Injectable } from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
  CreateMessageInput,
  FetchMessagesInput,
  FetchMessagesOutput,
  FindMessageByIdInput,
  UpdateMessageFilterQuery,
  UpdateMessageUpdateQuery,
} from '../types/message.type';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createMessage(
    createMessageInput: CreateMessageInput,
  ): Promise<Message> {
    const messageData: Prisma.MessageCreateInput = {
      ticket: {
        connect: {
          id: createMessageInput.ticketId,
        },
      },
      senderType: createMessageInput.senderType,
      ...(createMessageInput.content && {
        content: createMessageInput.content,
      }),
      ...(createMessageInput.senderId && {
        sender: { connect: { id: createMessageInput.senderId } },
      }),
      ...(createMessageInput.aiResponseStatus && {
        aiResponseStatus: createMessageInput.aiResponseStatus,
      }),
      ...(createMessageInput.aiResponseConfidence && {
        aiResponseConfidence: createMessageInput.aiResponseConfidence,
      }),
      ...(createMessageInput.aiResponseError && {
        aiResponseError: createMessageInput.aiResponseError,
      }),
    };

    return this.prisma.message.create({ data: messageData });
  }

  public async updateMessage(
    filterQuery: UpdateMessageFilterQuery,
    updateQuery: UpdateMessageUpdateQuery,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: filterQuery,
      data: updateQuery,
    });
  }

  public async findMessageById(
    findMessageByIdInput: FindMessageByIdInput,
  ): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: {
        id: findMessageByIdInput.messageId,
        ticketId: findMessageByIdInput.ticketId,
        aiResponseStatus: findMessageByIdInput.aiResponseStatus,
      },
    });
  }

  public async fetchMessages(
    fetchMessagesInput: FetchMessagesInput,
  ): Promise<FetchMessagesOutput[]> {
    return this.prisma.message.findMany({
      where: {
        ticketId: fetchMessagesInput.ticketId,
      },
      select: {
        id: true,
        senderId: true,
        senderType: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
