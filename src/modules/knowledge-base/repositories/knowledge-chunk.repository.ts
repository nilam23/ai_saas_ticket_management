import { Injectable, Logger } from '@nestjs/common';
import { CreateKnowledgeChunksInput } from '../types/knowledge-chunk.type';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class KnowledgeChunksRepository {
  private readonly logger = new Logger(KnowledgeChunksRepository.name);

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
}
