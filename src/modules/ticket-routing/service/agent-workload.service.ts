import { Injectable, Logger } from '@nestjs/common';
import {
  CreateAgentWorkloadInput,
  PickAgentsInput,
  UpdateAgentWorkloadInput,
} from '../types/agent-workload.type';
import { AgentWorkloadRepository } from '../repository/agent-workload.repository';
import { AgentWorkload } from '@prisma/client';

@Injectable()
export class AgentWorkloadService {
  private readonly logger = new Logger(AgentWorkloadService.name);
  constructor(
    private readonly agentWorkloadRepository: AgentWorkloadRepository,
  ) {}

  public async createAgentWorkload(
    createAgentWorkloadInput: CreateAgentWorkloadInput,
  ) {
    this.logger.log(
      `Creating workload for the agent: ${createAgentWorkloadInput.agentId}`,
    );
    await this.agentWorkloadRepository.createAgentWorkload(
      createAgentWorkloadInput,
    );
    this.logger.log(
      `Workload created for the agent: ${createAgentWorkloadInput.agentId}`,
    );
  }

  public async pickAgents(
    pickAgentInput: PickAgentsInput,
  ): Promise<AgentWorkload[]> {
    this.logger.log(
      `Picking available agents for tenant ${pickAgentInput.tenantId}`,
    );
    const agents =
      await this.agentWorkloadRepository.pickAgents(pickAgentInput);
    return agents;
  }

  public async updateAgentWorkload(
    updateAgentWorkloadInput: UpdateAgentWorkloadInput,
  ): Promise<void> {
    this.logger.log(
      `Updating workload for agent ${updateAgentWorkloadInput.agentId} with ${updateAgentWorkloadInput.delta}`,
    );
    await this.agentWorkloadRepository.updateAgentWorkload(
      updateAgentWorkloadInput,
    );
    this.logger.log(
      `Workload updated for the agent ${updateAgentWorkloadInput.agentId}`,
    );
  }
}
