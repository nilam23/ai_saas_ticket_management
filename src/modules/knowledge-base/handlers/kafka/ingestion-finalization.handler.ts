import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TenantDocEmbeddingGeneratedEventPayload } from '../../types/kafka-event.type';
import { KnowledgeIngestionService } from '../../service/knowledge-ingestion.service';

@Controller()
export class TenantDocIngestionFinalizationEventHandler {
  private readonly logger = new Logger(
    TenantDocIngestionFinalizationEventHandler.name,
  );

  constructor(
    private readonly knowledgeIngestionService: KnowledgeIngestionService,
  ) {}

  @KafkaEventPattern(
    KafkaTopic.EVENT_BUS,
    KafkaEvent.TENANT_DOC_EMBEDDINGS_GENERATED,
  )
  async handleDocIngestionFinalization(
    @Payload() event: EventEnvelope<TenantDocEmbeddingGeneratedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TENANT_DOC_EMBEDDINGS_GENERATED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    await this.knowledgeIngestionService.processIngestion(event.payload);

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_EMBEDDINGS_GENERATED} event with ID ${event.id} processed successfully`,
    );
  }
}
