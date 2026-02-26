import { CreateUserInput } from './user.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';

export type CreateUserApiHandlerEvent = {
  createUserInput: CreateUserInput;
  auditContext: AuditContext;
};
