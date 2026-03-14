import { BaseEvent } from 'src/infra/kafka/events/base.event';
import { KafkaEvent } from 'src/infra/kafka/enums/kafka.enum';
import { TenantDocEmbeddingGeneratedEventPayload } from '../types/kafka-event.type';

export class TenantDocEmbeddingGeneratedEvent extends BaseEvent<TenantDocEmbeddingGeneratedEventPayload> {
  constructor(payload: TenantDocEmbeddingGeneratedEventPayload) {
    super(KafkaEvent.TENANT_DOC_EMBEDDINGS_GENERATED, payload);
  }
}
