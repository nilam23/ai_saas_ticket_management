import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './service/ticket.service';
import { TicketRepository } from './repository/ticket.repository';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateTicketHandler } from './handlers/api/create-ticket.handler';
import { MessageRepository } from './repository/message.repository';
import { MessageService } from './service/message.service';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { AiResponseService } from './service/ai-response.service';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { AiResponseValidationService } from './service/ai-response-validation.service';
import { TicketAssignedEventHandler } from './handlers/kafka/ticket-assigned-event.handler';
import { TicketCreatedEventHandler } from './handlers/kafka/ticket-created-event.handler';
import { TicketClassificationService } from './service/ticket-classification.service';
import { TicketAssignmentService } from './service/ticket-assignment.service';
import { TicketClassifiedEventHandler } from './handlers/kafka/ticket-classified-event.handler';
import { ReviewAiResponseHandler } from './handlers/api/review-ai-response.handler';
import { FetchTicketsHandler } from './handlers/api/get-tickets.handler';
import { MessageController } from './message.controller';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => AiCoreModule),
    forwardRef(() => KnowledgeBaseModule),
  ],
  controllers: [
    TicketController,
    MessageController,
    TicketAssignedEventHandler,
    TicketCreatedEventHandler,
    TicketClassifiedEventHandler,
  ],
  providers: [
    TicketService,
    TicketRepository,
    MessageRepository,
    MessageService,
    PrismaService,
    CreateTicketHandler,
    AiResponseService,
    AiResponseValidationService,
    ReviewAiResponseHandler,
    TicketClassificationService,
    TicketAssignmentService,
    FetchTicketsHandler,
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
