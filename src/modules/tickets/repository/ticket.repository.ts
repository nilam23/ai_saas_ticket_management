import { Injectable } from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateTicketInput } from '../type/ticket.type';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createTicket(
    createTicketInput: CreateTicketInput,
  ): Promise<Ticket> {
    const ticketData: Prisma.TicketCreateInput = {
      tenantId: createTicketInput.tenantId,
      createdBy: {
        connect: {
          id: createTicketInput.createdById,
        },
      },
      subject: createTicketInput.subject,
    };

    return this.prisma.ticket.create({ data: ticketData });
  }
}
