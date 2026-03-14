import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { EmbeddingsGeneratorService } from '../../service/embeddings-generator.service';
import { TenantDocChunkedEventPayload } from '../../types/kafka-event.type';
import { TenantDocEmbeddingGeneratedEvent } from '../../events/tenant-doc-embedding-generated.event';

@Controller()
export class TenantDocEmbeddingGeneratorEventHandler {
  private readonly logger = new Logger(
    TenantDocEmbeddingGeneratorEventHandler.name,
  );

  constructor(
    private readonly embeddingGenerator: EmbeddingsGeneratorService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TENANT_DOC_CHUNKED)
  async handleDocEmbeddingGeneration(
    @Payload() event: EventEnvelope<TenantDocChunkedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TENANT_DOC_CHUNKED} event with ID ${event.id} consumed. Paylod: { docId: ${event.payload.docId}, tenantId: ${event.payload.tenantId}, chunks: ${event.payload.chunks.length} }`,
    );

    await this.embeddingGenerator.generateEmbeddings(event.payload);

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_CHUNKED} event with ID ${event.id} processed successfully`,
    );

    const embeddingGeneratedEvent = new TenantDocEmbeddingGeneratedEvent({
      tenantId: event.payload.tenantId,
      docId: event.payload.docId,
    });
    this.logger.log(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${embeddingGeneratedEvent.name}, Event ID: ${embeddingGeneratedEvent.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, embeddingGeneratedEvent);
  }
}
