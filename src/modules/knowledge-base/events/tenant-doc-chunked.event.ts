import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TenantDocChunkedEventPayload } from '../types/kafka-event.type';

export class TenantDocChunkedEvent extends BaseEvent<TenantDocChunkedEventPayload> {
  constructor(payload: TenantDocChunkedEventPayload) {
    super(KafkaEvent.TENANT_DOC_CHUNKED, payload);
  }
}
