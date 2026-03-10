import { Injectable, Logger } from '@nestjs/common';
import { invokeAPI } from 'src/shared/utils/axios.utils';
import {
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaModelOptions,
} from '../types/ollama.type';
import { OLLAMA_MODEL, OLLAMA_URL } from 'src/shared/utils/env-config.utils';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor() {}

  public async generate<T>(
    prompt: string,
    options?: OllamaModelOptions,
  ): Promise<T> {
    this.logger.log('AI generation started');

    const response = await invokeAPI<
      OllamaGenerateRequest,
      OllamaGenerateResponse
    >('POST', OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      ...(options && { options }),
    });

    this.logger.log('AI generation completed');

    return response.data.response as unknown as T;
  }
}
