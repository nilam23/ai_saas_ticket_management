import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
  PickAgentQueryInput,
  PickAgentResult,
} from '../types/agent-routing.type';

@Injectable()
export class AgentRoutingRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async pickAgent(
    pickAgentQueryInput: PickAgentQueryInput,
  ): Promise<PickAgentResult | null> {
    const result = await this.prisma.$queryRaw<PickAgentResult>`
      SELECT u.id "agentId"
      FROM users u
      JOIN agent_skill_map s ON u.id = s."agentId"
      JOIN agent_workload w ON u.id = w."agentId"
      WHERE
        u."tenantId" = ${pickAgentQueryInput.tenantId}
        AND s."skill" = ${pickAgentQueryInput.skill}::"AgentSkill"
        AND u."agentLevel" >= ${pickAgentQueryInput.requiredLevel}::"AgentLevel"
      ORDER BY w."activeTicketCount" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    return (result[0] as PickAgentResult) ?? null;
  }
}
