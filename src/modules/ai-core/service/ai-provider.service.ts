import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
} from 'src/shared/utils/env-config.utils';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly provider = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });
  private readonly model = GEMINI_MODEL;

  constructor() {}

  async generate(prompt: string): Promise<string> {
    this.logger.log(
      `AI generation started. Model: ${this.model}, Prompt Length: ${prompt.length}`,
    );

    const response = await this.provider.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    if (!response?.text) {
      this.logger.warn(`AI returned empty text. Model: ${this.model}`);

      // to be handled
      return '';
    }

    this.logger.log(
      `AI generation completed. Model: ${this.model}, Output Length: ${response.text.length}`,
    );

    return response.text;
  }
}
