import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketAssignmentService } from 'src/modules/tickets/service/ticket-assignment.service';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { TicketClassifiedEventPayload } from 'src/modules/tickets/types/kafka-event.type';
import { TicketAssignedEvent } from '../../events/ticket-assigned.event';

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

    this.logger.debug(
      `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${ticketAssignedEvent.name}, EventID: ${event.id}`,
    );
    this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, ticketAssignedEvent);
  }
}
