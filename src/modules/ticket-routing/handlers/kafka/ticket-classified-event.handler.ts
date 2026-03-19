import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketAssignmentService } from 'src/modules/ticket-routing/service/ticket-assignment.service';
import { TicketClassifiedEventPayload } from 'src/modules/ticket-classification/types/kafka-event.type';
import { TicketAssignedEvent } from 'src/modules/ticket-classification/events/ticket-assigned.event';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';

@Controller()
export class TicketClassifiedEventHandler {
  private readonly logger = new Logger(TicketClassifiedEventHandler.name);

  constructor(
    private readonly ticketAssignmentService: TicketAssignmentService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_CLASSIFIED)
  async handleTicketClassified(
    @Payload() event: EventEnvelope<TicketClassifiedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_CLASSIFIED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { tenantId, ticketId, message } = event.payload;
    await this.ticketAssignmentService.assignTicket({
      tenantId,
      ticketId,
    });

    this.logger.log(
      `${KafkaEvent.TICKET_CLASSIFIED} event with ID ${event.id} processed successfully`,
    );

    const ticketAssignedEvent = new TicketAssignedEvent({
      tenantId,
      ticketId,
      message,
    });

    this.logger.log(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${ticketAssignedEvent.name}, Event ID: ${event.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, ticketAssignedEvent);
  }
}
