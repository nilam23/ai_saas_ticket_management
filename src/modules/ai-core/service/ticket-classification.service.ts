import { Injectable, Logger } from '@nestjs/common';
import { generateTicketClassificationPrompt } from '../utils/prompt.utils';
import {
  TicketClassificationRawResult,
  TicketClassificationInput,
  TicketClassificationResult,
} from '../types/ticket-classification.type';
import { AiProviderService } from './ai-provider.service';
import { TicketClassificationSchema } from '../types/ticket-classification.schema';

@Injectable()
export class TicketClassificationService {
  private readonly logger = new Logger(TicketClassificationService.name);

  constructor(private readonly aiProviderService: AiProviderService) {}

  public async classifyTicket(
    classificationInput: TicketClassificationInput,
  ): Promise<TicketClassificationResult> {
    const { ticketId, subject, message } = classificationInput;

    this.logger.log(`Classifying the ticket ${ticketId}`);

    const prompt = generateTicketClassificationPrompt(subject, message);
    const aiResponse = await this.aiProviderService.generate<string>(prompt, {
      stop: ['Explanation:', 'Ticket Subject:', 'You are', '\n\n'],
    });
    const rawResponse = JSON.parse(aiResponse) as TicketClassificationRawResult;
    const validation = TicketClassificationSchema.safeParse(rawResponse);

    if (!validation.success) {
      this.logger.error(
        `Invalid AI classification. Error: ${validation.error}`,
      );
      throw new Error('AI classification validation failed');
    }

    this.logger.log(
      `Classification generated for the ticket ${ticketId}. Result: ${JSON.stringify(validation.data)}`,
    );

    return validation.data;
  }
}
