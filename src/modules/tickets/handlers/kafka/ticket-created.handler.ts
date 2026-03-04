import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enums';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { TicketCreatedEventPayload } from '../../type/kafka-event.type';
import { KafkaEvent } from '../../enums/kafka.enum';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketAssignmentService } from 'src/modules/ticket-routing/service/ticket-assignment.service';

@Controller()
export class TicketCreatedEventHandler {
  private readonly logger = new Logger(TicketCreatedEventHandler.name);

  constructor(
    private readonly ticketAssignmentService: TicketAssignmentService,
  ) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_CREATED)
  async handleTicketCreated(
    @Payload() event: EventEnvelope<TicketCreatedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_CREATED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { tenantId, ticketId } = event.payload;
    await this.ticketAssignmentService.assignTicket({ tenantId, ticketId });

    this.logger.log(
      `${KafkaEvent.TICKET_CREATED} event with ID ${event.id} processed successfully`,
    );
  }
}
