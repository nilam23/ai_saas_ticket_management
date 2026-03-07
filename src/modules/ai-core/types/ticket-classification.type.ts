import z from 'zod';
import { TicketClassificationSchema } from './ticket-classification.schema';

export type TicketClassificationInput = {
  tenantId: string;
  ticketId: string;
  subject: string;
  message: string;
  createdBy: string;
};

export type TicketClassificationRawResult = {
  category?: string;
  priority?: string;
  sentiment?: string;
  confidence?: number;
};

export type TicketClassificationResult = z.infer<
  typeof TicketClassificationSchema
>;
