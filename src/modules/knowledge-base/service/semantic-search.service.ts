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

  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly knowledgeChunkRepository: KnowledgeChunkRepository,
  ) {}

  public async retrieveContext(
    retrieveContextInput: RetrieveContextInput,
  ): Promise<RetrievedContextResult[]> {
    const { tenantId, query, topK } = retrieveContextInput;

    this.logger.log(
      `Retrieving context for the query ${query} for the tenant ${tenantId}`,
    );

    const queryEmbeddings =
      await this.aiProviderService.generateEmbedding(query);
    const embeddingVector = `[${queryEmbeddings.join(',')}]`;
    const retrievedContext =
      await this.knowledgeChunkRepository.fetchKnowledgeChunks({
        tenantId,
        embeddingVector,
        topK,
      });

    this.logger.log(
      `Context retrieved for the query ${query} for the tenant ${tenantId}`,
    );

    return retrievedContext;
  }
}
