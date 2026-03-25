import { AuditContext } from 'src/modules/audit/types/audit.type';
import { CreateTicketInput, FetchTicketsInput } from './ticket.type';
import {
  CreateMessageInput,
  FetchMessagesInput,
  ReviewAiResponseInput,
} from './message.type';

export type CreateTicketApiHandlerEvent = {
  createTicketInput: CreateTicketInput;
  auditContext: AuditContext;
};

export type ReviewAiResponseApiHandlerEvent = {
  reviewAiResponseInput: ReviewAiResponseInput;
  auditContext: AuditContext;
};

export type FetchTicketsApiHandlerEvent = {
  fetchTicketsInput: FetchTicketsInput;
};

export type CreateMessageApiHandlerEvent = {
  createMessageInput: CreateMessageInput;
  auditContext: AuditContext;
};

export type FetchMessagesApiHandlerEvent = {
  fetchMessagesInput: FetchMessagesInput;
};
