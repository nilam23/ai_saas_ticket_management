import { AuditContext } from 'src/modules/audit/types/audit.type';
import { CreateTicketInput } from './ticket.type';
import { ReviewAiResponseInput } from './message.type';

export type CreateTicketApiHandlerEvent = {
  createTicketInput: CreateTicketInput;
  auditContext: AuditContext;
};

export type ReviewAiResponseApiHandlerEvent = {
  reviewAiResponseInput: ReviewAiResponseInput;
  auditContext: AuditContext;
};
