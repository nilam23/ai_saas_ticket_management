import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TenantDocParsedEventPayload } from '../types/kafka-event.type';

export class TenantDocParsedEvent extends BaseEvent<TenantDocParsedEventPayload> {
  constructor(payload: TenantDocParsedEventPayload) {
    super(KafkaEvent.TENANT_DOC_PARSED, payload);
  }
}
