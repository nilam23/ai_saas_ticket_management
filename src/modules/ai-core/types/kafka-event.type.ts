import { TicketClassificationResult } from './ticket-classification.type';

export type TicketClassifiedEventPayload = {
  tenantId: string;
  ticketId: string;
  createdBy: string;
  classificationResult: TicketClassificationResult;
};
