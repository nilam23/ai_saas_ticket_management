import { Injectable } from '@nestjs/common';
import {
  CreateKnowledgeChunksInput,
  FetchKnowledgeChunksInput,
} from '../types/knowledge-chunk.type';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RetrievedContextResult } from '../types/semantic-search.type';

@Injectable()
export class KnowledgeChunkRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createKnowledgeChunks(
    createKnowledgeChunksInput: CreateKnowledgeChunksInput[],
  ): Promise<void> {
    const values = createKnowledgeChunksInput
      .map(
        (chunk) => `(
        gen_random_uuid(),
        '${chunk.tenantId}',
        '${chunk.docId}',
        ${chunk.chunkIndex},
        $$${chunk.content}$$,
        '[${chunk.embedding.join(',')}]'
      )`,
      )
      .join(',');

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_chunks
      (id, "tenantId", "documentId", "chunkIndex", content, embedding)
      VALUES ${values};
    `);
  }

  public async fetchKnowledgeChunks(
    fetchKnowledgeChunksInput: FetchKnowledgeChunksInput,
  ): Promise<RetrievedContextResult[]> {
    const { tenantId, embeddingVector, topK } = fetchKnowledgeChunksInput;
    const results = await this.prisma.$queryRawUnsafe<RetrievedContextResult[]>(
      `
        SELECT
          id,
          content,
          "chunkIndex",
          "documentId"
        FROM knowledge_chunks
        WHERE "tenantId" = $1
        ORDER BY embedding <=> $2::vector
        LIMIT $3
      `,
      tenantId,
      embeddingVector,
      topK,
    );

    return results;
  }
}
