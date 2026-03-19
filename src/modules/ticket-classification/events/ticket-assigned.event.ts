import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TicketAssignedEventPayload } from '../types/kafka-event.type';

export class TicketAssignedEvent extends BaseEvent<TicketAssignedEventPayload> {
  constructor(payload: TicketAssignedEventPayload) {
    super(KafkaEvent.TICKET_ASSIGNED, payload);
  }
}
