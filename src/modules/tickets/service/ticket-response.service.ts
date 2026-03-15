import { Injectable, Logger } from '@nestjs/common';
import { GenerateAiResponseInput } from '../types/ticket.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { SemanticSearchService } from 'src/modules/knowledge-base/service/semantic-search.service';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { getAiResponseGenerationPrompt } from 'src/modules/ai-core/utils/prompt.utils';
import {
  AI_RESPONSE_GENERATION_LLM_NUM_PREDICT,
  AI_RESPONSE_GENERATION_LLM_TEMP,
} from '../utils/constants';

@Injectable()
export class TicketResponseService {
  private readonly logger = new Logger(TicketResponseService.name);
  private readonly AI_DEFAULT_RESPONSE = `I don't have enough information in the knowledge base to answer this question.`;

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  private cleanAiResponse(response: string) {
    return response
      .replace(/^(RESPONSE|OUTPUT|ANSWER|REPLY)[:\s]*/i, '')
      .replace(/^(Sure!|Certainly!|Of course!)[^\n]*/i, '')
      .replace(/<\/?[a-z]+(\s[^>]*)?>/gi, '')
      .trim();
  }

  public async generateAiResponse(
    generateAiResponseInput: GenerateAiResponseInput,
    auditContext: AuditContext,
  ): Promise<string> {
    const { tenantId, ticketId, query } = generateAiResponseInput;
    this.logger.log(
      `Generating AI Response. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
    );

    const queryContext = await this.semanticSearchService.retrieveContext({
      tenantId,
      query,
    });

    if (queryContext.length === 0) {
      this.logger.warn(
        `No relevant context found for user query Returning default AI response. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
      );

      return this.AI_DEFAULT_RESPONSE;
    }

    const prompt = getAiResponseGenerationPrompt(query, queryContext);
    const response = await this.aiProviderService.generateText(prompt, {
      temperature: AI_RESPONSE_GENERATION_LLM_TEMP,
      num_predict: AI_RESPONSE_GENERATION_LLM_NUM_PREDICT,
      stop: ['<|end|>', '<|user|>', '<|system|>', 'Rules:'],
    });
    const cleanedResponse = this.cleanAiResponse(response);

    this.logger.log(
      `AI response generated. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
    );

    return cleanedResponse;
  }
}
