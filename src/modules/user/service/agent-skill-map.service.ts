import { Injectable, Logger } from '@nestjs/common';
import { AgentSkillMapRepository } from '../repository/agent-skill-map.repository';
import { CreateAgentSkillMapInput } from '../types/agent-skill-map.type';

@Injectable()
export class AgentSkillMapService {
  private readonly logger = new Logger(AgentSkillMapService.name);
  constructor(
    private readonly agentSkillMapRepository: AgentSkillMapRepository,
  ) {}

  public async createAgentSkillMap(
    createAgentSkillMapInput: CreateAgentSkillMapInput,
  ): Promise<void> {
    this.logger.debug(
      `Creating agent skill. Skill: ${createAgentSkillMapInput.skill}, AgentID: ${createAgentSkillMapInput.agentId}`,
    );
    await this.agentSkillMapRepository.createAgentSkillMap(
      createAgentSkillMapInput,
    );
    this.logger.debug(
      `Agent skill created. Skill: ${createAgentSkillMapInput.skill}, AgentID: ${createAgentSkillMapInput.agentId}`,
    );
  }
}
