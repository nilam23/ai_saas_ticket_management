import { CreateUserInput } from './user.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';

export type CreateAgentApiHandlerEvent = {
  createUserInput: CreateUserInput;
  auditContext: AuditContext;
};
