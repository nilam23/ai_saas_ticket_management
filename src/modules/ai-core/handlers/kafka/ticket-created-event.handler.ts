import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketCreatedEventPayload } from 'src/modules/tickets/type/kafka-event.type';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { TicketClassificationService } from '../../service/ticket-classification.service';
import { TicketClassifiedEvent } from '../../events/ticket-classified.event';

@Controller()
export class TicketCreatedEventHandler {
  private readonly logger = new Logger(TicketCreatedEventHandler.name);

  constructor(
    private readonly ticketClassificationService: TicketClassificationService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_CREATED)
  async handleTicketCreated(
    @Payload() event: EventEnvelope<TicketCreatedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_CREATED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const classificationResult =
      await this.ticketClassificationService.classifyTicket({
        ...event.payload,
      });

    this.logger.log(
      `${KafkaEvent.TICKET_CREATED} event with ID ${event.id} processed successfully`,
    );

    const ticketClassifiedEvent = new TicketClassifiedEvent({
      ticketId: event.payload.ticketId,
      tenantId: event.payload.tenantId,
      classificationResult,
    });

    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, ticketClassifiedEvent);
  }
}
