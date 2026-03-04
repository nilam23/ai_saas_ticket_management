import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { TicketCreatedEventPayload } from '../type/kafka-event.type';
import { KafkaEvent } from '../enums/kafka.enum';

export class TicketCreatedEvent extends BaseEvent<TicketCreatedEventPayload> {
  constructor(payload: TicketCreatedEventPayload) {
    super(KafkaEvent.TICKET_CREATED, payload);
  }
}
