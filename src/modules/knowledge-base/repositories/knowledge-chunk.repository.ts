import { Injectable } from '@nestjs/common';
import {
  CreateKnowledgeChunksInput,
  FetchKnowledgeChunksInput,
} from '../types/knowledge-chunk.type';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import {
  RawRetrievedContextResult,
  RetrievedContextResult,
} from '../types/semantic-search.type';

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
    const results = await this.prisma.$queryRaw<RawRetrievedContextResult[]>`
      WITH query_vector AS (
        SELECT ${embeddingVector}::vector AS embedding
      )
      SELECT
        kc.id,
        kc.content,
        kc."chunkIndex",
        kc."documentId",
        kc.embedding::text AS embedding,
        1 - (kc.embedding <=> qv.embedding) AS "similarityScore"
      FROM knowledge_chunks kc, query_vector qv
      WHERE kc."tenantId" = ${tenantId}
      ORDER BY kc.embedding <=> qv.embedding
      LIMIT ${topK}
    `;

    return results.map((row) => ({
      ...row,
      embedding: row.embedding.slice(1, -1).split(',').map(Number),
    }));
  }
}
