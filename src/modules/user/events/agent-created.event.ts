import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { AgentCreatedEventPayload } from '../types/kafka-event.type';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';

export class AgentCreatedEvent extends BaseEvent<AgentCreatedEventPayload> {
  constructor(payload: AgentCreatedEventPayload) {
    super(KafkaEvent.AGENT_CREATED, payload);
  }
}
