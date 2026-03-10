import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TicketClassifiedEventPayload } from '../types/kafka-event.type';

export class TicketClassifiedEvent extends BaseEvent<TicketClassifiedEventPayload> {
  constructor(payload: TicketClassifiedEventPayload) {
    super(KafkaEvent.TICKET_CLASSIFIED, payload);
  }
}
