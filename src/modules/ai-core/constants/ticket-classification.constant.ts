import { TicketPriority } from '@prisma/client';

export const TicketClassificationCategories = [
  'BUG',
  'FEATURE_REQUEST',
  'BILLING',
  'SUPPORT',
  'OTHER',
];

export const TicketClassificationPriorities = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
];

export const TicketClassificationSentiments = [
  'Positive',
  'Neutral',
  'Negative',
  'Frustrated',
];
