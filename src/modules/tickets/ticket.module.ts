import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './service/ticket.service';
import { TicketRepository } from './repository/ticket.repository';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateTicketHandler } from './handlers/create-ticket.handler';
import { MessageRepository } from './repository/message.repository';
import { MessageService } from './service/message.service';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { RoutingModule } from '../ticket-routing/routing.module';
import { AiResponseService } from './service/ai-response.service';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { AiResponseValidationService } from './service/ai-response-validation.service';
import { TicketAssignedEventHandler } from './handlers/kafka/ticket-assigned-event.handler';
import { ReviewAiResponseHandler } from './handlers/review-ai-response.handler';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    forwardRef(() => RoutingModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => AiCoreModule),
    forwardRef(() => KnowledgeBaseModule),
  ],
  controllers: [TicketController, TicketAssignedEventHandler],
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
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
