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
import { TicketCreatedEventHandler } from './handlers/kafka/ticket-created.handler';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [TicketController, TicketCreatedEventHandler],
  providers: [
    TicketService,
    TicketRepository,
    MessageRepository,
    PrismaService,
    CreateTicketHandler,
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
