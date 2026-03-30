import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { FetchTicketsApiHandlerEvent } from '../../types/api-handler-event.type';
import { TicketService } from '../../service/ticket.service';
import { Ticket } from '@prisma/client';

@Injectable()
export class FetchTicketsHandler extends BaseHttpHandler<
  FetchTicketsApiHandlerEvent,
  Ticket[]
> {
  private readonly logger = new Logger(FetchTicketsHandler.name);

  constructor(private readonly ticketService: TicketService) {
    super();
  }

  public async handle(
    event: FetchTicketsApiHandlerEvent,
  ): Promise<HttpResponse<Ticket[]>> {
    const { fetchTicketsInput } = event;
    try {
      this.logger.debug(
        `Handling request to fetch tickets. UserID: ${fetchTicketsInput.userId}, TenantID: ${fetchTicketsInput.tenantId}`,
      );
      const tickets = await this.ticketService.fetchTickets(fetchTicketsInput);
      this.logger.debug(
        `Tickets successfully fetched. Total Tickets: ${tickets.length}, UserID: ${fetchTicketsInput.userId}, TenantID: ${fetchTicketsInput.tenantId}`,
      );
      return this.ok(tickets);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching tickets. UserID: ${fetchTicketsInput.userId}, TenantID: ${fetchTicketsInput.tenantId}, Error: ${message}`,
      );
      return this.internalServerError(message);
    }
  }
}
