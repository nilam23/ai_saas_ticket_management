import { AgentWorkload } from '@prisma/client';

export const ASSIGNMENT_STRATEGY = 'ASSIGNMENT_STRATEGY';

export interface AssignmentStrategy {
  select(workloads: AgentWorkload[]): string | null;
}
