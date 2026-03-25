import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { MessageService } from '../../service/message.service';
import { FetchMessagesApiHandlerEvent } from '../../types/api-handler-event.type';
import { FetchMessagesOutput } from '../../types/message.type';

@Injectable()
export class FetchMessagesHandler extends BaseHttpHandler<
  FetchMessagesApiHandlerEvent,
  FetchMessagesOutput[]
> {
  private readonly logger = new Logger(FetchMessagesHandler.name);

  constructor(private readonly messageService: MessageService) {
    super();
  }

  public async handle(
    event: FetchMessagesApiHandlerEvent,
  ): Promise<HttpResponse<FetchMessagesOutput[]>> {
    const { fetchMessagesInput } = event;
    try {
      this.logger.debug(
        `Handling request to fetch messages. TicketID: ${fetchMessagesInput.ticketId}, UserID: ${fetchMessagesInput.userId}, TenantID: ${fetchMessagesInput.tenantId}`,
      );
      const messages =
        await this.messageService.fetchMessages(fetchMessagesInput);
      this.logger.debug(
        `Messages successfully fetched. Total Messages: ${messages.length}, TicketID: ${fetchMessagesInput.ticketId}, UserID: ${fetchMessagesInput.userId}, TenantID: ${fetchMessagesInput.tenantId}`,
      );
      return this.ok(messages);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching messages. TicketID: ${fetchMessagesInput.ticketId}, UserID: ${fetchMessagesInput.userId}, TenantID: ${fetchMessagesInput.tenantId}, Error: ${message}`,
      );
      return this.internalServerError(message);
    }
  }
}
