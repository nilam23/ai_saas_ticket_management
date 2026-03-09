import { AgentLevel, AgentSkill } from '@prisma/client';

export type PickAgentQueryInput = {
  tenantId: string;
  skill: AgentSkill;
  requiredLevel: AgentLevel;
};

export type PickAgentResult = {
  agentId: string;
};
