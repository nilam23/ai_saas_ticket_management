import { TicketPriority } from '@prisma/client';
import { AllowedTicketCategories, AllowedTicketSentiments } from 'src/modules/tickets/enums/ticket.enum';
import { z } from 'zod';

export const TicketClassificationSchema = z.object({
  category: z.enum(AllowedTicketCategories),
  priority: z.enum(TicketPriority),
  sentiment: z.enum(AllowedTicketSentiments),
  confidence: z.number().min(0).max(1),
});
