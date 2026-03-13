import { Injectable, Logger } from '@nestjs/common';
import { GenerateEmbeddingsInput } from '../types/embeddings-generator.type';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';

@Injectable()
export class EmbeddingsGeneratorService {
  private readonly logger = new Logger(EmbeddingsGeneratorService.name);
  private readonly BATCH_SIZE = 10;

  constructor(private readonly aiProviderService: AiProviderService) {}

  public async generateEmbeddings(
    generateEmbeddingsInput: GenerateEmbeddingsInput,
  ): Promise<number[][]> {
    const { docId, chunks } = generateEmbeddingsInput;
    const embeddings: number[][] = [];

    this.logger.log(
      `Generating batched embeddings for doc ${docId}. Total chunks ${chunks.length}`,
    );

    for (let i = 0; i < chunks.length; i += this.BATCH_SIZE) {
      const batch = chunks.slice(i, i + this.BATCH_SIZE);
      const batchEmbeddings = await Promise.all(
        batch.map((chunk) =>
          this.aiProviderService.generateEmbedding(chunk.content),
        ),
      );
      embeddings.push(...batchEmbeddings);
    }

    this.logger.log(`Embeddings generated for doc ${docId}`);

    return embeddings;
  }
}
