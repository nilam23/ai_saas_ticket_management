import { TicketClassificationResult } from 'src/modules/ai-core/types/ticket-classification.type';

export type AssignTicketInput = {
  tenantId: string;
  ticketId: string;
  classificationResult: TicketClassificationResult;
};
