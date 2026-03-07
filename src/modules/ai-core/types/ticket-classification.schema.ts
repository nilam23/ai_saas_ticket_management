import { z } from 'zod';
import {
  TicketClassificationCategories,
  TicketClassificationPriorities,
  TicketClassificationSentiments,
} from '../constants/ticket-classification.constant';

export const TicketClassificationSchema = z.object({
  category: z.enum(TicketClassificationCategories),
  priority: z.enum(TicketClassificationPriorities),
  sentiment: z.enum(TicketClassificationSentiments),
  confidence: z.number().min(0).max(1),
});
