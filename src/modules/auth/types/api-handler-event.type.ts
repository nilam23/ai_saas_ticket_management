import { AuditContext } from 'src/modules/audit/types/audit.type';
import { RegisterInput, UserSignInInput } from './auth.type';

export type RegisterApiHandlerEvent = {
  registerInput: RegisterInput;
  auditContext: AuditContext;
};

export type UserSignInApiHandlerEvent = {
  userSignInInput: UserSignInInput;
  auditContext: AuditContext;
};
