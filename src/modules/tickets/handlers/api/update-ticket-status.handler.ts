import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UpdateTicketStatusApiHandlerEvent } from '../../types/api-handler-event.type';
import { TicketService } from '../../service/ticket.service';

@Injectable()
export class UpdateTicketStatusHandler extends BaseHttpHandler<
  UpdateTicketStatusApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(UpdateTicketStatusHandler.name);

  constructor(private readonly ticketService: TicketService) {
    super();
  }

  public async handle(
    event: UpdateTicketStatusApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { updateTicketStatusInput, auditContext } = event;
    try {
      this.logger.debug(
        `Handling request to update ticket status. TicketID: ${updateTicketStatusInput.ticketId}, Status: ${updateTicketStatusInput.status}, UserID: ${auditContext.actorUserId}, TenantID: ${updateTicketStatusInput.tenantId}`,
      );
      await this.ticketService.updateTicket(
        updateTicketStatusInput,
        auditContext,
      );
      this.logger.debug(
        `Ticket status successfully updated. TicketID: ${updateTicketStatusInput.ticketId}, Status: ${updateTicketStatusInput.status}, UserID: ${auditContext.actorUserId}, TenantID: ${updateTicketStatusInput.tenantId}`,
      );
      return this.ok();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error updating ticket status. TicketID: ${updateTicketStatusInput.ticketId}, Status: ${updateTicketStatusInput.status}, UserID: ${auditContext.actorUserId}, TenantID: ${updateTicketStatusInput.tenantId}, Error: ${message}`,
      );
      return this.internalServerError(message);
    }
  }
}
