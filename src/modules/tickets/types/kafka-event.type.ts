export type TicketCreatedEventPayload = {
  tenantId: string;
  ticketId: string;
  subject: string;
  message: string;
};

export type TicketClassifiedEventPayload = {
  tenantId: string;
  ticketId: string;
  message: string;
};

export type TicketAssignedEventPayload = {
  tenantId: string;
  ticketId: string;
  message: string;
};
