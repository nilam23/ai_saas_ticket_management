import { Injectable, Logger } from '@nestjs/common';
import {
  GroundingValidationResult,
  SemanticRelevanceValidationResult,
  StructuralValidationResult,
} from 'src/shared/types/ai-validation.type';
import {
  MAX_RESPONSE_LENGTH,
  THRESHOLD_GROUNDING_SCORE,
  THRESHOLD_RELEVANCE_SCORE,
  MIN_RESPONSE_LENGTH,
  PROMPT_LEAK_PATTERNS,
  GROUNDING_WEIGHT,
  RELEVANCE_WEIGHT,
  AUTO_SEND_THRESHOLD,
  AGENT_REVIEW_THRESHOLD,
} from '../constants/ai-validation.constants';
import { RetrievedContextResult } from 'src/modules/knowledge-base/types/semantic-search.type';
import { AiResponseValidationResult } from '../types/message.type';
import { AiResponseStatus } from '@prisma/client';

@Injectable()
export class AiResponseValidationService {
  private readonly logger = new Logger(AiResponseValidationService.name);

  constructor() {}

  public validateStructure(response: string): StructuralValidationResult {
    const reasons: string[] = [];

    if (response.length < MIN_RESPONSE_LENGTH) {
      reasons.push(`Response too short (${response.length} chars)`);
    }
    if (response.length > MAX_RESPONSE_LENGTH) {
      reasons.push(`Response too long (${response.length} chars)`);
    }

    const leakedPattern = PROMPT_LEAK_PATTERNS.find((pattern) =>
      pattern.test(response),
    );
    if (leakedPattern) {
      reasons.push(`Prompt leak detected: ${leakedPattern}`);
    }

    if (!response.trim()) {
      reasons.push('Response is empty');
    }

    const lastChar = response.trim().slice(-1);
    if (!/[.!?]/.test(lastChar)) {
      reasons.push('Response does not end with a complete sentence');
    }

    return {
      passed: reasons.length === 0,
      reasons,
    };
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dot = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }

  public validateGrounding(
    responseEmbeddings: number[],
    retrievedChunks: RetrievedContextResult[],
  ): GroundingValidationResult {
    const scores = retrievedChunks.map((chunk) =>
      this.cosineSimilarity(responseEmbeddings, chunk.embedding),
    );
    const bestScore = scores.reduce((max, curr) => (curr > max ? curr : max));
    const passed = bestScore >= THRESHOLD_GROUNDING_SCORE;

    return {
      passed,
      score: bestScore,
      reason: passed
        ? undefined
        : `Response not grounded in any chunk (best score: ${bestScore.toFixed(2)})`,
    };
  }

  public validateSemanticRelevance(
    queryEmbedding: number[],
    responseEmbeddings: number[],
  ): SemanticRelevanceValidationResult {
    const relevaceScore = this.cosineSimilarity(
      responseEmbeddings,
      queryEmbedding,
    );
    const passed = relevaceScore >= THRESHOLD_RELEVANCE_SCORE;

    return {
      passed,
      score: relevaceScore,
      reason: passed
        ? undefined
        : `Response not relevant to user query (relevance score: ${relevaceScore.toFixed(2)})`,
    };
  }

  public validateAiResponse(
    response: string,
    responseEmbeddings: number[],
    queryContext: RetrievedContextResult[],
    queryEmbeddings: number[],
  ): AiResponseValidationResult {
    const structuralValidation = this.validateStructure(response);
    if (!structuralValidation.passed) {
      this.logger.warn(`Structural validation failed.`, {
        reasons: structuralValidation.reasons,
        responsePreview: response,
      });
      return {
        status: AiResponseStatus.FAILED,
        confidence: 0,
        error: 'Structural validation failed',
      };
    }

    const groundingValidation = this.validateGrounding(
      responseEmbeddings,
      queryContext,
    );
    if (!groundingValidation.passed) {
      this.logger.warn(`Grounding validation failed.`, {
        reason: groundingValidation.reason,
        responsePreview: response,
      });
      return {
        status: AiResponseStatus.FAILED,
        confidence: 0,
        error: 'Grounding validation failed',
      };
    }

    const semanticRelevanceValidation = this.validateSemanticRelevance(
      queryEmbeddings,
      responseEmbeddings,
    );
    if (!semanticRelevanceValidation.passed) {
      this.logger.warn(`Semantic relevance validation failed.`, {
        reason: semanticRelevanceValidation.reason,
        responsePreview: response,
      });
      return {
        status: AiResponseStatus.FAILED,
        confidence: 0,
        error: 'Semantic relevance validation failed',
      };
    }

    const confidenceScore =
      groundingValidation.score * GROUNDING_WEIGHT +
      semanticRelevanceValidation.score * RELEVANCE_WEIGHT;

    if (confidenceScore >= AUTO_SEND_THRESHOLD) {
      this.logger.log(
        `Confidence score reliable, auto sending the AI response. Confidence Score: ${confidenceScore}`,
      );
      return {
        status: AiResponseStatus.AUTO_SEND,
        confidence: confidenceScore,
      };
    } else if (confidenceScore >= AGENT_REVIEW_THRESHOLD) {
      this.logger.warn(
        `Confidence score not reliable, assigning for agent review. Confidence Score: ${confidenceScore}`,
      );
      return {
        status: AiResponseStatus.QUEUE_FOR_REVIEW,
        confidence: confidenceScore,
      };
    } else {
      this.logger.warn(
        `Confidence score too low, discarding AI response. Confidence Score: ${confidenceScore}`,
      );
      return {
        status: AiResponseStatus.FAILED,
        confidence: confidenceScore,
        error: 'AI confidence score is too low',
      };
    }
  }
}
