import { AgentSkill } from '@prisma/client';

export type AgentCreatedEventPayload = {
  agentId: string;
  tenantId: string;
  skills: AgentSkill[];
};
