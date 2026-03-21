import { Injectable, Logger } from '@nestjs/common';
import {
  CreateAgentWorkloadInput,
  UpdateAgentWorkloadInput,
} from '../types/agent-workload.type';
import { AgentWorkloadRepository } from '../repository/agent-workload.repository';

@Injectable()
export class AgentWorkloadService {
  private readonly logger = new Logger(AgentWorkloadService.name);
  constructor(
    private readonly agentWorkloadRepository: AgentWorkloadRepository,
  ) {}

  public async createAgentWorkload(
    createAgentWorkloadInput: CreateAgentWorkloadInput,
  ) {
    this.logger.debug(
      `Creating agent workload. AgentID: ${createAgentWorkloadInput.agentId}`,
    );
    await this.agentWorkloadRepository.createAgentWorkload(
      createAgentWorkloadInput,
    );
    this.logger.debug(
      `Agent workload created. AgentID: ${createAgentWorkloadInput.agentId}`,
    );
  }

  public async updateAgentWorkload(
    updateAgentWorkloadInput: UpdateAgentWorkloadInput,
  ): Promise<void> {
    this.logger.debug(
      `Updating agent workload. AgentID: ${updateAgentWorkloadInput.agentId}, Delta: ${updateAgentWorkloadInput.delta}`,
    );
    await this.agentWorkloadRepository.updateAgentWorkload(
      updateAgentWorkloadInput,
    );
    this.logger.debug(
      `Agent workload updated. AgentID: ${updateAgentWorkloadInput.agentId}`,
    );
  }
}
