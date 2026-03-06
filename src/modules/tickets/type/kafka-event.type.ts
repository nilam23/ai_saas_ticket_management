export type TicketCreatedEventPayload = {
  tenantId: string;
  ticketId: string;
  subject: string;
  message: string;
  createdBy: string;
};
