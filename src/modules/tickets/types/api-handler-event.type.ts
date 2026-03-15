import { AuditContext } from 'src/modules/audit/types/audit.type';
import { CreateTicketInput, GenerateAiResponseInput } from './ticket.type';

export type CreateTicketApiHandlerEvent = {
  createTicketInput: CreateTicketInput;
  auditContext: AuditContext;
};

export type GenerateAiResponseHandlerEvent = {
  generateAiResponseInput: GenerateAiResponseInput;
  auditContext: AuditContext;
};
