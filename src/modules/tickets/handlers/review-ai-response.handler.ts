import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { normalizeError } from 'src/shared/utils/error.utils';
import { ReviewAiResponseApiHandlerEvent } from '../types/api-handler-event.type';
import { AiResponseService } from '../service/ai-response.service';
import {
  AgentReviewForbiddenException,
  MessageNotFoundException,
} from '../exceptions/ticket-service.exception';

@Injectable()
export class ReviewAiResponseHandler extends BaseHttpHandler<
  ReviewAiResponseApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(ReviewAiResponseHandler.name);

  constructor(private readonly aiResponseService: AiResponseService) {
    super();
  }

  public async handle(
    event: ReviewAiResponseApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { reviewAiResponseInput, auditContext } = event;
    const { tenantId, ticketId, messageId, agentId } = reviewAiResponseInput;
    try {
      this.logger.log(
        `Handling request to review AI response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${agentId}, TenantID: ${tenantId}`,
      );
      await this.aiResponseService.reviewAiResponse(
        reviewAiResponseInput,
        auditContext,
      );
      this.logger.log(
        `AI response reviewed. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${agentId}, TenantID: ${tenantId}`,
      );
      return this.ok();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error reviewing AI response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${agentId}, TenantID: ${tenantId}, Error: ${message}`,
      );
      if (error instanceof AgentReviewForbiddenException) {
        return this.forbidden(message);
      } else if (error instanceof MessageNotFoundException) {
        return this.badRequest(message);
      }
      return this.internalServerError(message);
    }
  }
}
