import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { AgentWorkloadService } from '../../service/agent-workload.service';
import { AgentCreatedEventPayload } from 'src/modules/user/types/kafka-event.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { AgentSkillMapService } from '../../service/agent-skill-map.service';
import { AgentSkill } from '@prisma/client';

@Controller()
export class AgentCreatedEventHandler {
  private readonly logger = new Logger(AgentCreatedEventHandler.name);

  constructor(
    private readonly agentWorkloadService: AgentWorkloadService,
    private readonly agentSkillMapService: AgentSkillMapService,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.AGENT_CREATED)
  async handleAgentCreated(
    @Payload() event: EventEnvelope<AgentCreatedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.AGENT_CREATED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { agentId, tenantId, skills } = event.payload;
    await Promise.all([
      this.agentWorkloadService.createAgentWorkload({ agentId, tenantId }),
      ...skills.map((skill: AgentSkill) =>
        this.agentSkillMapService.createAgentSkillMap({
          tenantId,
          agentId,
          skill,
        }),
      ),
    ]);

    this.logger.log(
      `${KafkaEvent.AGENT_CREATED} event with ID ${event.id} processed successfully`,
    );
  }
}
