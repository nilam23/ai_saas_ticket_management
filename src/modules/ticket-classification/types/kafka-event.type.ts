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
