import { Injectable, Logger } from '@nestjs/common';
import { invokeAPI } from 'src/shared/utils/axios.utils';
import {
  OllamaEmbeddingRequest,
  OllamaEmbeddingResponse,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaModelOptions,
} from '../types/ollama.type';
import {
  OLLAMA_EMBEDDING_GENERATION_MODEL,
  OLLAMA_EMBEDDING_GENERATION_URL,
  OLLAMA_TEXT_GENERATION_MODEL,
  OLLAMA_TEXT_GENERATION_URL,
} from 'src/shared/utils/env-config.utils';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor() {}

  public async generateText<T>(
    prompt: string,
    options?: OllamaModelOptions,
  ): Promise<T> {
    this.logger.log('AI generation started');

    const response = await invokeAPI<
      OllamaGenerateRequest,
      OllamaGenerateResponse
    >('POST', OLLAMA_TEXT_GENERATION_URL, {
      model: OLLAMA_TEXT_GENERATION_MODEL,
      prompt,
      stream: false,
      ...(options && { options }),
    });

    this.logger.log('AI generation completed');

    return response.data.response as unknown as T;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    const response = await invokeAPI<
      OllamaEmbeddingRequest,
      OllamaEmbeddingResponse
    >('POST', OLLAMA_EMBEDDING_GENERATION_URL, {
      model: OLLAMA_EMBEDDING_GENERATION_MODEL,
      prompt: text,
    });
    return response.data.embedding;
  }
}
