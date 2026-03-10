import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { TicketModule } from '../tickets/ticket.module';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { RoutingModule } from '../ticket-routing/routing.module';
import { TicketCreatedEventHandler } from './handlers/kafka/ticket-created-event.handler';
import { TicketClassificationService } from './service/ticket-classification.service';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    forwardRef(() => TicketModule),
    forwardRef(() => UserModule),
    AiCoreModule,
    RoutingModule,
  ],
  controllers: [TicketCreatedEventHandler],
  providers: [TicketClassificationService],
})
export class ClassificationModule {}
