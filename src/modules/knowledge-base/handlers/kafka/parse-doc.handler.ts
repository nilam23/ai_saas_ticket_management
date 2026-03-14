import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TenantDocUploadedEventPayload } from 'src/modules/tenants/types/kafka-event.type';
import { DocParserService } from '../../service/doc-parser.service';
import { TenantDocParsedEvent } from '../../events/tenant-doc-parsed.event';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';

@Controller()
export class TenantDocParserEventHandler {
  private readonly logger = new Logger(TenantDocParserEventHandler.name);

  constructor(
    private readonly docParserService: DocParserService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TENANT_DOC_UPLOADED)
  async handleDocParsing(
    @Payload() event: EventEnvelope<TenantDocUploadedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TENANT_DOC_UPLOADED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const cleanedText = await this.docParserService.parseDoc(event.payload);

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_UPLOADED} event with ID ${event.id} processed successfully`,
    );

    const docParsedEvent = new TenantDocParsedEvent({
      tenantId: event.payload.tenantId,
      docId: event.payload.docId,
      cleanedText,
    });
    this.logger.log(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${docParsedEvent.name}, Event ID: ${docParsedEvent.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, docParsedEvent);
  }
}
