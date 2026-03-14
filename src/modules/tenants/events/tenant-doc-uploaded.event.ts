import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TenantDocUploadedEventPayload } from '../types/kafka-event.type';

export class TenantDocUploadedEvent extends BaseEvent<TenantDocUploadedEventPayload> {
  constructor(payload: TenantDocUploadedEventPayload) {
    super(KafkaEvent.TENANT_DOC_UPLOADED, payload);
  }
}
