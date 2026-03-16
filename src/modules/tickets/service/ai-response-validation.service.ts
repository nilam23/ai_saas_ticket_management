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
} from '../constants/ai-validation.constants';
import { RetrievedContextResult } from 'src/modules/knowledge-base/types/semantic-search.type';

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
}
