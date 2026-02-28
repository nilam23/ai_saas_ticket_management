import { AuditContext } from 'src/modules/audit/types/audit.type';
import {
  RegisterCustomerInput,
  RegisterInput,
  UserSignInInput,
} from './auth.type';

export type RegisterApiHandlerEvent = {
  registerInput: RegisterInput;
  auditContext: AuditContext;
};

export type UserSignInApiHandlerEvent = {
  userSignInInput: UserSignInInput;
  auditContext: AuditContext;
};

export type RegisterCustomerApiHandlerEvent = {
  registerCustomerrInput: RegisterCustomerInput;
  auditContext: AuditContext;
};
