import { Injectable, Logger } from '@nestjs/common';
import { GenerateAiResponseInput } from '../types/ticket.type';
import { SemanticSearchService } from 'src/modules/knowledge-base/service/semantic-search.service';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { getAiResponseGenerationPrompt } from 'src/modules/ai-core/utils/prompt.utils';
import {
  RESPONSE_GENERATION_LLM_MAX_TOKENS,
  RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
  RESPONSE_GENERATION_LLM_TEMP,
} from '../constants/ai-validation.constants';
import { AiResponseValidationService } from './ai-response-validation.service';
import { AiResponseGenerationResult } from '../types/message.type';
import { AiResponseStatus, SenderType } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { MessageService } from './message.service';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';

@Injectable()
export class TicketResponseService {
  private readonly logger = new Logger(TicketResponseService.name);

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidationService: AiResponseValidationService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
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
    this.logger.log(
      `Generating AI Response. TicketID: ${ticketId}, TenantID: ${tenantId}`,
    );

    const queryEmbeddings =
      await this.aiProviderService.generateEmbedding(query);
    const queryContext = await this.semanticSearchService.retrieveContext({
      tenantId,
      query,
      queryEmbeddings,
    });
    let responseGenerationResult: AiResponseGenerationResult = {
      confidence: 0,
      status: AiResponseStatus.QUEUE_FOR_REVIEW,
    };

    if (queryContext.length) {
      this.logger.log(
        `Query context retrieved, generating response. Contexts: ${queryContext.length}, TicketID: ${ticketId}, TenantID: ${tenantId}`,
      );
      const prompt = getAiResponseGenerationPrompt(query, queryContext);
      const rawResponse = await this.aiProviderService.generateText(prompt, {
        temperature: RESPONSE_GENERATION_LLM_TEMP,
        num_predict: RESPONSE_GENERATION_LLM_MAX_TOKENS,
        stop: RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
      });

      this.logger.log(
        `Cleaning, generating embeddings and validating AI response. Response: "${rawResponse}", TicketID: ${ticketId}, tenantID: ${tenantId}`,
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
        `No relevant context found for user query. TicketID: ${ticketId}, TenantID: ${tenantId}`,
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
    this.logger.log(
      `Creating message data. Message: ${JSON.stringify(messageData)}`,
    );
    const message = await this.messageService.createMessage(messageData);

    const systemUser = await this.userService.getUserData({
      tenantId,
      email: getTenantSystemUserEmail(tenantId),
    });
    this.logger.log(`System user fetched for the tenant ${tenantId}`);

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: systemUser.id,
      action: AuditLogAction.GENERATE_AI_RESPONSE,
      entityType: AuditLogEntityType.MESSAGE,
      entityId: message.id,
    });

    this.logger.log(
      `AI response generation attempt completed. Final Response: ${JSON.stringify(responseGenerationResult)}, TicketID: ${ticketId}, tenantID: ${tenantId}`,
    );
  }
}
