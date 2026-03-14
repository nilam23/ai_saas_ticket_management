import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { TextChunkerService } from '../../service/text-chunker.service';
import { TenantDocParsedEventPayload } from '../../types/kafka-event.type';
import { TenantDocChunkedEvent } from '../../events/tenant-doc-chunked.event';

@Controller()
export class TenantDocTextChunkerEventHandler {
  private readonly logger = new Logger(TenantDocTextChunkerEventHandler.name);
  private readonly CHUNK_SIZE = 500;
  private readonly CHUNK_OVERLAP = 100;

  constructor(
    private readonly textChunkerService: TextChunkerService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TENANT_DOC_PARSED)
  handleDocTextChunking(
    @Payload() event: EventEnvelope<TenantDocParsedEventPayload>,
  ) {
    const { tenantId, docId, cleanedText } = event.payload;

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_PARSED} event with ID ${event.id} consumed. Paylod: { docId: ${docId}, tenantId: ${tenantId} }`,
    );

    const chunks = this.textChunkerService.chunkText({
      docId,
      tenantId,
      text: cleanedText,
      options: { chunkSize: this.CHUNK_SIZE, chunkOverlap: this.CHUNK_OVERLAP },
    });

    this.logger.log(
      `Generated ${chunks.length} chunks. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_PARSED} event with ID ${event.id} processed successfully`,
    );

    const docChunkedEvent = new TenantDocChunkedEvent({
      tenantId,
      docId,
      chunks,
    });
    this.logger.log(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${docChunkedEvent.name}, Event ID: ${docChunkedEvent.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, docChunkedEvent);
  }
}
