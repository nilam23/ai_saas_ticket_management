import { Injectable, Logger } from '@nestjs/common';
import { GenerateAiResponseInput } from '../types/ticket.type';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { SemanticSearchService } from 'src/modules/knowledge-base/service/semantic-search.service';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { getAiResponseGenerationPrompt } from 'src/modules/ai-core/utils/prompt.utils';
import {
  AGENT_REVIEW_THRESHOLD,
  AI_DEFAULT_RESPONSE,
  AUTO_SEND_THRESHOLD,
  GROUNDING_WEIGHT,
  RELEVANCE_WEIGHT,
  RESPONSE_GENERATION_LLM_MAX_TOKENS,
  RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
  RESPONSE_GENERATION_LLM_TEMP,
} from '../constants/ai-validation.constants';
import { AiResponseValidationService } from './ai-response-validation.service';
import { RetrievedContextResult } from 'src/modules/knowledge-base/types/semantic-search.type';

@Injectable()
export class TicketResponseService {
  private readonly logger = new Logger(TicketResponseService.name);

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiResponseValidationService: AiResponseValidationService,
  ) {}

  private cleanAiResponse(response: string): string {
    return response
      .replace(/^(RESPONSE|OUTPUT|ANSWER|REPLY)[:\s]*/i, '')
      .replace(/^(Sure!|Certainly!|Of course!)[^\n]*/i, '')
      .replace(/<\/?[a-z]+(\s[^>]*)?>/gi, '')
      .trim();
  }

  private validateAiResponse(
    response: string,
    responseEmbeddings: number[],
    queryContext: RetrievedContextResult[],
    queryEmbeddings: number[],
  ) {
    const structuralValidation =
      this.aiResponseValidationService.validateStructure(response);
    if (!structuralValidation.passed) {
      this.logger.warn(`Structural validation failed.`, {
        reasons: structuralValidation.reasons,
        responsePreview: response,
      });
      // handle
    }

    const groundingValidation =
      this.aiResponseValidationService.validateGrounding(
        responseEmbeddings,
        queryContext,
      );
    if (!groundingValidation.passed) {
      this.logger.warn(`Grounding validation failed.`, {
        reason: groundingValidation.reason,
        responsePreview: response,
      });
      // handle
    }

    const semanticRelevanceValidation =
      this.aiResponseValidationService.validateSemanticRelevance(
        queryEmbeddings,
        responseEmbeddings,
      );
    if (!semanticRelevanceValidation.passed) {
      this.logger.warn(`Semantic relevance validation failed.`, {
        reason: semanticRelevanceValidation.reason,
        responsePreview: response,
      });
      // handle
    }

    const confidenceScore =
      groundingValidation.score * GROUNDING_WEIGHT +
      semanticRelevanceValidation.score * RELEVANCE_WEIGHT;

    if (confidenceScore >= AUTO_SEND_THRESHOLD) {
      this.logger.log(
        `Confidence score reliable, auto sending the AI response. Confidence Score: ${confidenceScore}`,
      );
      // handle
    } else if (confidenceScore >= AGENT_REVIEW_THRESHOLD) {
      this.logger.warn(
        `Confidence score not reliable, assigning for Agnet review. Confidence Score: ${confidenceScore}`,
      );
      // handle
    } else {
      this.logger.warn(
        `Confidence score too low, discarding AI response. Confidence Score: ${confidenceScore}`,
      );
      // handle
    }
  }

  public async generateAiResponse(
    generateAiResponseInput: GenerateAiResponseInput,
    auditContext: AuditContext,
  ): Promise<string> {
    const { tenantId, ticketId, query } = generateAiResponseInput;
    this.logger.log(
      `Generating AI Response. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
    );

    const queryEmbeddings =
      await this.aiProviderService.generateEmbedding(query);
    const queryContext = await this.semanticSearchService.retrieveContext({
      tenantId,
      query,
      queryEmbeddings,
    });

    if (queryContext.length === 0) {
      this.logger.warn(
        `No relevant context found for user query Returning default AI response. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
      );

      return AI_DEFAULT_RESPONSE; // handle
    }

    const prompt = getAiResponseGenerationPrompt(query, queryContext);
    const response = await this.aiProviderService.generateText(prompt, {
      temperature: RESPONSE_GENERATION_LLM_TEMP,
      num_predict: RESPONSE_GENERATION_LLM_MAX_TOKENS,
      stop: RESPONSE_GENERATION_LLM_STOP_SEQUENCES,
    });

    this.logger.log(
      `AI response generated. TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, TenantID: ${tenantId}`,
    );

    this.logger.log(
      `Cleaning and validating generated AI response. Raw Response: ${response}, TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, tenantID: ${tenantId}`,
    );

    const cleanedResponse = this.cleanAiResponse(response);
    const responseEmbeddings =
      await this.aiProviderService.generateEmbedding(response);
    this.validateAiResponse(
      cleanedResponse,
      responseEmbeddings,
      queryContext,
      queryEmbeddings,
    );

    this.logger.log(
      `Cleaning and validation of AI response completed. Final Response: ${response}, TicketID: ${ticketId}, AgentID: ${auditContext.actorUserId}, tenantID: ${tenantId}`,
    );

    return cleanedResponse;
  }
}
