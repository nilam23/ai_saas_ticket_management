import { Injectable, Logger } from '@nestjs/common';
import { GenerateEmbeddingsInput } from '../types/embeddings-generator.type';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';
import { KnowledgeChunkRepository } from '../repositories/knowledge-chunk.repository';
import { EMBEDDING_GENERATION_BATCH_SIZE } from '../constants/common.constants';

@Injectable()
export class EmbeddingsGeneratorService {
  private readonly logger = new Logger(EmbeddingsGeneratorService.name);

  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly knowledgeChunkRepository: KnowledgeChunkRepository,
  ) {}

  public async generateEmbeddings(
    generateEmbeddingsInput: GenerateEmbeddingsInput,
  ): Promise<number[][]> {
    const { tenantId, docId, chunks } = generateEmbeddingsInput;
    const embeddings: number[][] = [];

    this.logger.debug(
      `Generating batched embeddings. DocID: ${docId}, TenantID: ${tenantId}, Total chunks: ${chunks.length}`,
    );

    for (let i = 0; i < chunks.length; i += EMBEDDING_GENERATION_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBEDDING_GENERATION_BATCH_SIZE);
      const batchEmbeddings = await Promise.all(
        batch.map((chunk) =>
          this.aiProviderService.generateEmbedding(chunk.content),
        ),
      );
      embeddings.push(...batchEmbeddings);
    }

    this.logger.debug(
      `Generated ${embeddings.length} embeddings. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    this.logger.debug(
      `Storing embeddings. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    const knowledgeChunksRecords = chunks.map((chunk) => ({
      tenantId,
      docId,
      chunkIndex: chunk.index,
      content: chunk.content,
      embedding: embeddings[chunk.index],
    }));

    await this.knowledgeChunkRepository.createKnowledgeChunks(
      knowledgeChunksRecords,
    );

    this.logger.debug(
      `Embeddings stored successfully. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    return embeddings;
  }
}
