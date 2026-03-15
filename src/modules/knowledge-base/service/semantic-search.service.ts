import { Injectable, Logger } from '@nestjs/common';
import {
  RetrieveContextInput,
  RetrievedContextResult,
} from '../types/semantic-search.type';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { KnowledgeChunkRepository } from '../repositories/knowledge-chunk.repository';

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private readonly TOP_K = 5;
  private readonly MIN_SIMILARITY = 0.6;

  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly knowledgeChunkRepository: KnowledgeChunkRepository,
  ) {}

  public async retrieveContext(
    retrieveContextInput: RetrieveContextInput,
  ): Promise<RetrievedContextResult[]> {
    const { tenantId, query } = retrieveContextInput;

    this.logger.log(
      `Retrieving context. Query: ${query}, TenantID: ${tenantId}`,
    );

    const queryEmbeddings =
      await this.aiProviderService.generateEmbedding(query);
    const embeddingVector = `[${queryEmbeddings.join(',')}]`;
    const retrievedContext =
      await this.knowledgeChunkRepository.fetchKnowledgeChunks({
        tenantId,
        embeddingVector,
        topK: this.TOP_K,
      });

    const relevantContext = retrievedContext.filter(
      (ctx) => ctx.similarityScore >= this.MIN_SIMILARITY,
    );

    this.logger.log(
      `Context retrieved. Query: "${query}", TenantId=${tenantId}, Total: ${retrievedContext.length}, Above Threshold: ${relevantContext.length}`,
    );

    return relevantContext;
  }
}
