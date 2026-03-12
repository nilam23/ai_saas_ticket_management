import { Injectable, Logger } from '@nestjs/common';
import { GenerateEmbeddingsInput } from '../types/embeddings-generator.type';
import { TextChunk } from '../types/text-chunker.type';
import { AiProviderService } from 'src/modules/ai-core/service/ai-provider.service';

@Injectable()
export class EmbeddingsGeneratorService {
  private readonly logger = new Logger(EmbeddingsGeneratorService.name);

  constructor(private readonly aiProviderService: AiProviderService) {}

  public async generateEmbeddings(
    generateEmbeddingsInput: GenerateEmbeddingsInput,
  ): Promise<number[][]> {
    const { docId, chunks } = generateEmbeddingsInput;

    this.logger.log(
      `Generating embeddings for the doc ${docId}. Total chunks ${chunks.length}`,
    );

    const embeddings = await Promise.all(
      chunks.map((chunk: TextChunk) =>
        this.aiProviderService.generateEmbedding(chunk.content),
      ),
    );

    this.logger.log(`Embeddings generated for the doc ${docId}`);

    return embeddings;
  }
}
