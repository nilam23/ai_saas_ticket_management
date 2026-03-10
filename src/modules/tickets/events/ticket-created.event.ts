import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { TicketCreatedEventPayload } from '../types/kafka-event.type';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';

export class TicketCreatedEvent extends BaseEvent<TicketCreatedEventPayload> {
  constructor(payload: TicketCreatedEventPayload) {
    super(KafkaEvent.TICKET_CREATED, payload);
  }
}
