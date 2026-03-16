import { AiResponseStatus, SenderType } from '@prisma/client';

export type CreateMessageInput = {
  ticketId: string;
  senderId?: string;
  senderType: SenderType;
  content?: string;
  aiResponseStatus?: AiResponseStatus;
  aiResponseConfidence?: number;
  aiResponseError?: string;
};

export type AiResponseGenerationResult = {
  response?: string;
  status: AiResponseStatus;
  confidence: number;
  error?: string;
};

export type AiResponseValidationResult = {
  status: AiResponseStatus;
  confidence: number;
  error?: string;
};
