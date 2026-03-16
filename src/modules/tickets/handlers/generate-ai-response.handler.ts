import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { GenerateAiResponseHandlerEvent } from '../types/api-handler-event.type';
import { TicketResponseService } from '../service/ticket-response.service';

@Injectable()
export class GenerateAiResponseHandler extends BaseHttpHandler<
  GenerateAiResponseHandlerEvent,
  void
> {
  private readonly logger = new Logger(GenerateAiResponseHandler.name);

  constructor(private readonly ticketResponseService: TicketResponseService) {
    super();
  }

  public async handle(
    event: GenerateAiResponseHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { generateAiResponseInput, auditContext } = event;
    try {
      this.logger.log(
        `Handling request to generate AI response. TicketID: ${generateAiResponseInput.ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${generateAiResponseInput.tenantId}`,
      );
      await this.ticketResponseService.generateAiResponse(
        generateAiResponseInput,
        auditContext,
      );
      this.logger.log(
        `AI response generated. TicketID: ${generateAiResponseInput.ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${generateAiResponseInput.tenantId}`,
      );
      return this.ok();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error generating AI response. TicketID: ${generateAiResponseInput.ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${generateAiResponseInput.tenantId}, Error: ${message}`,
      );

      this.handleUnknownError(message);
    }
  }
}
