import { TicketStatus } from '@prisma/client';

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
};

export type UpdateTicketFilterQuery = {
  id: string;
  tenantId: string;
};

export type UpdateTicketUpdateQuery = {
  status?: TicketStatus;
  assignedTo?: object;
  updatedAt: Date;
};
