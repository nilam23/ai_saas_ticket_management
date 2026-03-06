import { Injectable, Logger } from '@nestjs/common';
import { generateTicketClassificationPrompt } from '../utils/prompt.utils';
import {
  TicketClassificationInput,
  TicketClassificationResult,
} from '../types/ticket-classification.type';
import { AiProviderService } from './ai-provider.service';

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
    const classificationRsult = await this.aiProviderService.generate(prompt);

    this.logger.log(
      `Classification generated for the ticket ${ticketId}. Result: ${classificationRsult}`,
    );

    return JSON.parse(classificationRsult) as TicketClassificationResult;
  }
}
