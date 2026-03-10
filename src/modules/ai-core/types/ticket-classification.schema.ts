import {
  TicketCategory,
  TicketPriority,
  TicketSentiment,
} from '@prisma/client';
import { z } from 'zod';

export const TicketClassificationSchema = z.object({
  category: z.enum(TicketCategory),
  priority: z.enum(TicketPriority),
  sentiment: z.enum(TicketSentiment),
  confidence: z.number().min(0).max(1),
});
