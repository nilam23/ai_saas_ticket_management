import { Injectable } from '@nestjs/common';
import { CreateAgentSkillMapInput } from '../types/agent-skill-map.type';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { AgentSkillMap } from '@prisma/client';

@Injectable()
export class AgentSkillMapRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createAgentSkillMap(
    createAgentSkillMapInput: CreateAgentSkillMapInput,
  ): Promise<AgentSkillMap> {
    return this.prisma.agentSkillMap.create({
      data: {
        tenant: {
          connect: {
            id: createAgentSkillMapInput.tenantId,
          },
        },
        agent: {
          connect: {
            id: createAgentSkillMapInput.agentId,
          },
        },
        skill: createAgentSkillMapInput.skill,
      },
    });
  }
}
