import {
  TicketCategory,
  TicketPriority,
  TicketSentiment,
  TicketStatus,
} from '@prisma/client';

export type CreateTicketInput = {
  subject: string;
  message: string;
  tenantId: string;
  createdById: string;
};

export type FindTicketByIdInput = {
  tenantId: string;
  ticketId: string;
};

export type UpdateTicketInput = {
  tenantId: string;
  ticketId: string;
  assignedToId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  sentiment?: TicketSentiment;
  confidence?: number;
};

export type UpdateTicketFilterQuery = {
  id: string;
  tenantId: string;
};

export type UpdateTicketUpdateQuery = {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  sentiment?: TicketSentiment;
  assignedTo?: { connect: { id: string } };
  updatedAt: Date;
};

export type GenerateAiResponseInput = {
  tenantId: string;
  ticketId: string;
  query: string;
};
