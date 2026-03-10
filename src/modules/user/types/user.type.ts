import { UserRole, User, AgentLevel, AgentSkill } from '@prisma/client';

export type GetUserDataInput = {
  email: string;
  tenantId: string;
};

export type GetUserDataOutput = Omit<User, 'passwordHash'>;

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  tenantId: string;
  role?: UserRole;
  agentLevel?: AgentLevel;
  agentSkills?: AgentSkill[];
};

export type GetTenantUsersInput = {
  tenantId: string;
};

export type GetTenantUsersOutput = Omit<User, 'passwordHash' | 'tenantId'>[];

export type JwtPayload = Omit<
  User,
  'name' | 'passwordHash' | 'agentLevel' | 'createdAt' | 'updatedAt'
>;

export type UserInfoInRequest = Omit<
  User,
  'passwordHash' | 'agentLevel' | 'createdAt' | 'updatedAt'
>;
