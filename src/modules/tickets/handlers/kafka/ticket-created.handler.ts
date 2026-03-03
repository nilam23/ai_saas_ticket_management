import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enums';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { TicketCreatedEventPayload } from '../../type/kafka-event.type';
import { TicketService } from '../../service/ticket.service';
import { KafkaEvent } from '../../enums/kafka.enum';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';

@Controller()
export class TicketCreatedEventHandler {
  private readonly logger = new Logger(TicketCreatedEventHandler.name);

  constructor(private readonly ticketService: TicketService) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_CREATED)
  handleTicketCreated(
    @Payload() event: EventEnvelope<TicketCreatedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_CREATED} event consumed. Event ID: ${event.id}, Paylod: ${JSON.stringify(event.payload)}`,
    );
  }
}
