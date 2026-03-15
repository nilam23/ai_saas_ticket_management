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
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { RoutingModule } from '../ticket-routing/routing.module';
import { GenerateAiResponseHandler } from './handlers/generate-ai-response.handler';
import { TicketResponseService } from './service/ticket-response.service';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { AiResponseValidationService } from './service/ai-response-validation.service';

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
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    MessageRepository,
    PrismaService,
    CreateTicketHandler,
    GenerateAiResponseHandler,
    TicketResponseService,
    AiResponseValidationService,
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
