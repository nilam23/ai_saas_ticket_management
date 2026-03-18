import { AiResponseStatus, SenderType } from '@prisma/client';
import { AgentReviewAction } from '../enums/message.enum';

export type CreateMessageInput = {
  ticketId: string;
  senderId?: string;
  senderType: SenderType;
  content?: string;
  aiResponseStatus?: AiResponseStatus;
  aiResponseConfidence?: number;
  aiResponseError?: string;
};

export type GenerateAiResponseInput = {
  tenantId: string;
  ticketId: string;
  query: string;
};

export type GenerateAiResponseResult = {
  response?: string;
  status: AiResponseStatus;
  confidence: number;
  error?: string;
};

export type ValidateAiResponseResult = {
  status: AiResponseStatus;
  confidence: number;
  error?: string;
};

export type ReviewAiResponseInput = {
  tenantId: string;
  ticketId: string;
  messageId: string;
  agentId: string;
  action: AgentReviewAction;
  updatedResponse?: string;
};

export type UpdateMessageInput = {
  ticketId: string;
  messageId: string;
  content?: string;
  aiResponseStatus: AiResponseStatus;
};

export type UpdateMessageFilterQuery = {
  id: string;
  ticketId: string;
};

export type UpdateMessageUpdateQuery = {
  content?: string;
  aiResponseStatus: AiResponseStatus;
  updatedAt: Date;
};
