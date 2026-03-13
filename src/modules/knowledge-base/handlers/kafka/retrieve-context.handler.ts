import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { SemanticSearchService } from '../../service/semantic-search.service';
import { RetrieveContextEventPayload } from '../../types/kafka-event.type';

@Controller()
export class RetrieveContextEventHandler {
  private readonly logger = new Logger(RetrieveContextEventHandler.name);

  constructor(private readonly semanticSearchService: SemanticSearchService) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.RETRIEVE_CONTEXT)
  async retrieveContext(
    @Payload() event: EventEnvelope<RetrieveContextEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.RETRIEVE_CONTEXT} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    await this.semanticSearchService.retrieveContext({ ...event.payload });

    this.logger.log(
      `${KafkaEvent.RETRIEVE_CONTEXT} event with ID ${event.id} processed successfully`,
    );
  }
}
