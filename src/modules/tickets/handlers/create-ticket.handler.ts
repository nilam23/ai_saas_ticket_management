import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { CreateTicketApiHandlerEvent } from '../type/api-handler-event.type';
import { TicketService } from '../service/ticket.service';

@Injectable()
export class CreateTicketHandler extends BaseHttpHandler<
  CreateTicketApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(CreateTicketHandler.name);

  constructor(private readonly ticketService: TicketService) {
    super();
  }

  public async handle(
    event: CreateTicketApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { createTicketInput, auditContext } = event;
    try {
      this.logger.log(
        `Handling request to create ticket by customer: ${auditContext.actorUserId} for tenant: ${createTicketInput.tenantId}`,
      );
      await this.ticketService.createTicket(createTicketInput, auditContext);
      this.logger.log(
        `Ticket successfully created by customer: ${createTicketInput.createdById} for the tenant: ${createTicketInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error creating ticket by customer: ${auditContext.actorUserId} for the tenant: ${createTicketInput.tenantId}. Error: ${message}`,
      );

      this.handleUnknownError(message);
    }
  }
}
