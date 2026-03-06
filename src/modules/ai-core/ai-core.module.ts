import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { TicketCreatedEventHandler } from './handlers/kafka/ticket-created-event.handler';
import { TicketClassificationService } from './service/ticket-classification.service';
import { AiProviderService } from './service/ai-provider.service';

@Module({
  imports: [KafkaModule],
  controllers: [TicketCreatedEventHandler],
  providers: [TicketClassificationService, AiProviderService],
  exports: [],
})
export class AiCoreModule {}
