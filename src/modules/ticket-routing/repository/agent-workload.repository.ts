import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
  CreateAgentWorkloadInput,
  PickAgentsInput,
  UpdateAgentWorkloadInput,
} from '../types/agent-workload.type';
import { AgentWorkload, Prisma } from '@prisma/client';

@Injectable()
export class AgentWorkloadRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createAgentWorkload(
    createAgentWorkloadInput: CreateAgentWorkloadInput,
  ): Promise<AgentWorkload> {
    try {
      const agentWorkloadData: Prisma.AgentWorkloadCreateInput = {
        tenant: {
          connect: {
            id: createAgentWorkloadInput.tenantId,
          },
        },
        agent: {
          connect: {
            id: createAgentWorkloadInput.agentId,
          },
        },
      };

      return await this.prisma.agentWorkload.create({
        data: agentWorkloadData,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async pickAgents(
    pickAgentInput: PickAgentsInput,
  ): Promise<AgentWorkload[]> {
    const result = await this.prisma.$queryRaw<AgentWorkload[]>`
      SELECT "agentId"
      FROM "agent_workload"
      WHERE "tenantId" = ${pickAgentInput.tenantId}
      ORDER BY "activeTicketCount" ASC, "updatedAt" ASC
      FOR UPDATE SKIP LOCKED
    `;

    return result;
  }

  public async updateAgentWorkload(
    updateAgentWorkloadInput: UpdateAgentWorkloadInput,
  ) {
    return this.prisma.agentWorkload.update({
      where: {
        agentId: updateAgentWorkloadInput.agentId,
        tenantId: updateAgentWorkloadInput.tenantId,
      },
      data: {
        activeTicketCount: { increment: updateAgentWorkloadInput.delta },
      },
    });
  }
}
