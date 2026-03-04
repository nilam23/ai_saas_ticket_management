import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enums';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { AgentWorkloadService } from '../../service/agent-workload.service';
import { AgentCreatedEventPayload } from 'src/modules/user/types/kafka-event.type';
import { KafkaEvent } from 'src/modules/tickets/enums/kafka.enum';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';

@Controller()
export class AgentCreatedEventHandler {
  private readonly logger = new Logger(AgentCreatedEventHandler.name);

  constructor(private readonly agentWorkloadService: AgentWorkloadService) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.AGENT_CREATED)
  async handleAgentCreated(
    @Payload() event: EventEnvelope<AgentCreatedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.AGENT_CREATED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { agentId, tenantId } = event.payload;
    await this.agentWorkloadService.createAgentWorkload({ agentId, tenantId });

    this.logger.log(
      `${KafkaEvent.AGENT_CREATED} event with ID ${event.id} processed successfully`,
    );
  }
}
