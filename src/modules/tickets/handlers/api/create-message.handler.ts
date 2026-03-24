import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { CreateMessageApiHandlerEvent } from '../../types/api-handler-event.type';
import { MessageService } from '../../service/message.service';

@Injectable()
export class CreateMessageHandler extends BaseHttpHandler<
  CreateMessageApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(CreateMessageHandler.name);

  constructor(private readonly messageService: MessageService) {
    super();
  }

  public async handle(
    event: CreateMessageApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { createMessageInput, auditContext } = event;
    try {
      this.logger.debug(
        `Handling request to create message. UserID: ${createMessageInput.senderId}, TenantID: ${auditContext.tenantId}`,
      );
      await this.messageService.createMessage(createMessageInput, auditContext);
      this.logger.debug(
        `Message successfully created. UserID: ${createMessageInput.senderId}, TenantID: ${auditContext.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error creating message. UserID: ${createMessageInput.senderId}, TenantID: ${auditContext.tenantId}, Error: ${message}`,
      );
      return this.internalServerError(message);
    }
  }
}
