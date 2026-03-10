import { Injectable } from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateMessageInput } from '../types/message.type';

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
      content: createMessageInput.content,
      ...(createMessageInput.senderId && {
        sender: { connect: { id: createMessageInput.senderId } },
      }),
    };

    return this.prisma.message.create({ data: messageData });
  }
}
