import { AuditContext } from 'src/modules/audit/types/audit.type';
import { CreateTicketInput } from './ticket.type';

export type CreateTicketApiHandlerEvent = {
  createTicketInput: CreateTicketInput;
  auditContext: AuditContext;
};
