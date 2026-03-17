import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { KafkaEvent, KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import type { EventEnvelope } from 'src/infra/kafka/type/kafka.type';
import { KafkaEventPattern } from 'src/infra/kafka/decorators/event-pattern.decorator';
import { TicketAssignedEventPayload } from 'src/modules/ticket-classification/types/kafka-event.type';
import { AiResponseService } from '../../service/ai-response.service';
@Controller()
export class TicketAssignedEventHandler {
  private readonly logger = new Logger(TicketAssignedEventHandler.name);

  constructor(private readonly aiResponseService: AiResponseService) {}

  @KafkaEventPattern(KafkaTopic.EVENT_BUS, KafkaEvent.TICKET_ASSIGNED)
  async handleTicketAssigned(
    @Payload() event: EventEnvelope<TicketAssignedEventPayload>,
  ) {
    this.logger.log(
      `${KafkaEvent.TICKET_ASSIGNED} event with ID ${event.id} consumed. Paylod: ${JSON.stringify(event.payload)}`,
    );

    const { tenantId, ticketId, message } = event.payload;
    await this.aiResponseService.generateAiResponse({
      tenantId,
      ticketId,
      query: message,
    });

    this.logger.log(
      `${KafkaEvent.TICKET_ASSIGNED} event with ID ${event.id} processed successfully`,
    );
  }
}
