import { AgentWorkload } from '@prisma/client';
import { AssignmentStrategy } from './strategy.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeastLoadStrategy implements AssignmentStrategy {
  select(workloads: AgentWorkload[]): string | null {
    return workloads[0]?.agentId ?? null;
  }
}
