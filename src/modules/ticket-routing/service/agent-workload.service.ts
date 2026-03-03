import { Injectable, Logger } from '@nestjs/common';
import { CreateAgentWorkloadInput } from '../types/agent-workload.type';
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
}
