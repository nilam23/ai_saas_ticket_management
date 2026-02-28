import { Role } from '@prisma/client';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  tenantName: string;
  role?: Role;
};

export type UserSignInInput = {
  email: string;
  password: string;
  tenantId: string;
};

export type RegisterCustomerInput = {
  name: string;
  email: string;
  password: string;
  tenantId: string;
};
