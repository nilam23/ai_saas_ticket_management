import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TenantDocUploadedEventPayload } from 'src/modules/tenants/types/kafka-event.type';
import { DocParserService } from '../../service/doc-parser.service';

@Controller()
export class TenantDocUploadedEventHandler {
  private readonly logger = new Logger(TenantDocUploadedEventHandler.name);

  constructor(private readonly docParserService: DocParserService) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TENANT_DOC_UPLOADED)
  async handleTenantDocUploaded(
    @Payload() event: EventEnvelope<TenantDocUploadedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TENANT_DOC_UPLOADED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    await this.docParserService.extractDocText(event.payload);

    this.logger.log(
      `${KafkaEvent.TENANT_DOC_UPLOADED} event with ID ${event.id} processed successfully`,
    );
  }
}
