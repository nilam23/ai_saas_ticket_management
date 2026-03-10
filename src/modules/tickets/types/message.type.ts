import { SenderType } from '@prisma/client';

export type CreateMessageInput = {
  ticketId: string;
  senderId?: string;
  senderType: SenderType;
  content: string;
};
