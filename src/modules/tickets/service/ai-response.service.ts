import { Injectable, Logger } from '@nestjs/common';
import { SemanticSearchService } from 'src/modules/knowledge-base/service/semantic-search.service';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { getAiResponseGenerationPrompt } from 'src/modules/ai-core/utils/prompt.utils';
import {
  RESPONSE_GENERATION_LLM_MAX_TOKENS,
  RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
  RESPONSE_GENERATION_LLM_TEMP,
} from '../constants/ai-validation.constants';
import { AiResponseValidationService } from './ai-response-validation.service';
import {
  GenerateAiResponseInput,
  GenerateAiResponseResult,
  ReviewAiResponseInput,
} from '../types/message.type';
import { AiResponseStatus, SenderType } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { MessageService } from './message.service';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { AgentReviewAction } from '../enums/message.enum';
import { TicketService } from './ticket.service';
import {
  AgentReviewForbiddenException,
  MessageNotFoundException,
} from '../exceptions/ticket-service.exception';

@Injectable()
export class AiResponseService {
  private readonly logger = new Logger(AiResponseService.name);

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidationService: AiResponseValidationService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
    private readonly ticketService: TicketService,
  ) {}

  private cleanAiResponse(response: string): string {
    return response
      .replace(/^(RESPONSE|OUTPUT|ANSWER|REPLY)[:\s]*/i, '')
      .replace(/^(Sure!|Certainly!|Of course!)[^\n]*/i, '')
      .replace(/<\/?[a-z]+(\s[^>]*)?>/gi, '')
      .trim();
  }

  public async generateAiResponse(
    generateAiResponseInput: GenerateAiResponseInput,
  ): Promise<void> {
    const { tenantId, ticketId, query } = generateAiResponseInput;
    this.logger.debug(
      `Generating AI Response. TicketID: ${ticketId}, TenantID: ${tenantId}`,
    );

    const queryEmbeddings =
      await this.aiProviderService.generateEmbedding(query);
    const queryContext = await this.semanticSearchService.retrieveContext({
      tenantId,
      query,
      queryEmbeddings,
    });
    let responseGenerationResult: GenerateAiResponseResult = {
      confidence: 0,
      status: AiResponseStatus.QUEUE_FOR_REVIEW,
    };

    if (queryContext.length) {
      this.logger.debug(
        `Query context retrieved, generating response. Contexts: ${queryContext.length}, TicketID: ${ticketId}`,
      );
      const prompt = getAiResponseGenerationPrompt(query, queryContext);
      const rawResponse = await this.aiProviderService.generateText(prompt, {
        temperature: RESPONSE_GENERATION_LLM_TEMP,
        num_predict: RESPONSE_GENERATION_LLM_MAX_TOKENS,
        stop: RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
      });

      this.logger.debug(
        `Cleaning, generating embeddings and validating AI response. Response: "${rawResponse}", TicketID: ${ticketId}`,
      );

      const cleanedResponse = this.cleanAiResponse(rawResponse);
      const responseEmbeddings =
        await this.aiProviderService.generateEmbedding(rawResponse);
      responseGenerationResult = {
        response: cleanedResponse,
        ...this.aiResponseValidationService.validateAiResponse(
          cleanedResponse,
          responseEmbeddings,
          queryContext,
          queryEmbeddings,
        ),
      };
    } else {
      this.logger.warn(
        `No relevant context found for user query. TicketID: ${ticketId}`,
      );
      responseGenerationResult.error = 'No context found';
      responseGenerationResult.status = AiResponseStatus.FAILED;
    }

    const messageData = {
      ticketId,
      senderType: SenderType.AI,
      ...(responseGenerationResult.status !== AiResponseStatus.FAILED && {
        content: responseGenerationResult.response,
      }),
      aiResponseStatus: responseGenerationResult.status,
      aiResponseConfidence: responseGenerationResult.confidence,
      ...(responseGenerationResult.error && {
        aiResponseError: responseGenerationResult.error,
      }),
    };
    this.logger.debug(
      `Creating message data. Message: ${JSON.stringify(messageData)}`,
    );
    const message = await this.messageService.createMessage(messageData);

    const systemUser = await this.userService.getUserData({
      tenantId,
      email: getTenantSystemUserEmail(tenantId),
    });
    this.logger.debug(`System user fetched. TenantID ${tenantId}`);

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: systemUser.id,
      action: AuditLogAction.GENERATE_AI_RESPONSE,
      entityType: AuditLogEntityType.MESSAGE,
      entityId: message.id,
      afterState: responseGenerationResult,
    });

    this.logger.debug(
      `AI response generation attempt completed. Final Result: ${JSON.stringify(responseGenerationResult)}, TicketID: ${ticketId}, tenantID: ${tenantId}`,
    );
  }

  public async reviewAiResponse(
    reviewAiResponseInput: ReviewAiResponseInput,
    auditContext: AuditContext,
  ) {
    const { tenantId, ticketId, messageId, agentId, action, updatedResponse } =
      reviewAiResponseInput;
    const aiResponseStatus = AgentReviewAction.APPROVED
      ? AiResponseStatus.APPROVED
      : AiResponseStatus.REJECTED;

    this.logger.debug(
      `Reviewing AI response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${agentId}, Action: ${action}`,
    );

    const ticket = await this.ticketService.findTicketById({
      tenantId,
      ticketId,
    });
    if (ticket.assignedToId !== agentId) {
      this.logger.error(
        `Agent not allowed to review AI response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${agentId}`,
      );
      throw new AgentReviewForbiddenException();
    }

    const message = await this.messageService.findMessageById({
      ticketId,
      messageId,
      aiResponseStatus: AiResponseStatus.QUEUE_FOR_REVIEW,
    });
    if (!message) {
      this.logger.error(
        `Message not found or not reviewable. MessageID: ${messageId}, TicketID: ${ticketId}`,
      );
      throw new MessageNotFoundException(messageId);
    }

    const updatedMessage = await this.messageService.updateMessage({
      ticketId,
      messageId,
      aiResponseStatus,
      ...(updatedResponse && { content: updatedResponse }),
    });

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: agentId,
      action: AuditLogAction.REVIEW_AI_RESPONSE,
      entityType: AuditLogEntityType.MESSAGE,
      entityId: messageId,
      afterState: {
        aiResponse: updatedMessage.content,
        action,
        aiResponseStatus,
        reviewedBy: agentId,
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });
  }
}
