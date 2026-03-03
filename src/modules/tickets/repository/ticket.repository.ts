import { Injectable } from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
  CreateTicketInput,
  FindTicketByIdInput,
  UpdateTicketFilterQuery,
  UpdateTicketUpdateQuery,
} from '../type/ticket.type';

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

  public async findTicketById(
    findTicketByIdInput: FindTicketByIdInput,
  ): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: {
        id: findTicketByIdInput.ticketId,
        tenantId: findTicketByIdInput.tenantId,
      },
    });
  }

  public async updateTicket(
    filterQuery: UpdateTicketFilterQuery,
    updateQuery: UpdateTicketUpdateQuery,
  ): Promise<Ticket> {
    return this.prisma.ticket.update({
      where: filterQuery,
      data: updateQuery,
    });
  }
}
