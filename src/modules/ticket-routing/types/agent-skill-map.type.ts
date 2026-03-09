import { AgentSkill } from '@prisma/client';

export type CreateAgentSkillMapInput = {
  tenantId: string;
  agentId: string;
  skill: AgentSkill;
};
