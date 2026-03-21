export type CreateAgentWorkloadInput = {
  tenantId: string;
  agentId: string;
};

export type PickAgentsInput = {
  tenantId: string;
};

export type UpdateAgentWorkloadInput = {
  agentId: string;
  tenantId: string;
  delta: number;
};
