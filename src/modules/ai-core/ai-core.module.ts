import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { TicketCreatedEventHandler } from './handlers/kafka/ticket-created-event.handler';
import { TicketClassificationService } from './service/ticket-classification.service';
import { AiProviderService } from './service/ai-provider.service';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [KafkaModule, AuditModule, UserModule],
  controllers: [TicketCreatedEventHandler],
  providers: [TicketClassificationService, AiProviderService],
  exports: [],
})
export class AiCoreModule {}
