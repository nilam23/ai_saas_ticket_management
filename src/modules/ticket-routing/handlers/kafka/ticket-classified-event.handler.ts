import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketAssignmentService } from 'src/modules/ticket-routing/service/ticket-assignment.service';
import { TicketClassifiedEventPayload } from 'src/modules/ai-core/types/kafka-event.type';

@Controller()
export class TicketClassifiedEventHandler {
  private readonly logger = new Logger(TicketClassifiedEventHandler.name);

  constructor(
    private readonly ticketAssignmentService: TicketAssignmentService,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_CLASSIFIED)
  async handleTicketClassified(
    @Payload() event: EventEnvelope<TicketClassifiedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_CLASSIFIED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { tenantId, ticketId } = event.payload;
    await this.ticketAssignmentService.assignTicket({
      tenantId,
      ticketId,
    });

    this.logger.log(
      `${KafkaEvent.TICKET_CLASSIFIED} event with ID ${event.id} processed successfully`,
    );
  }
}
