export type TicketClassificationInput = {
  tenantId: string;
  ticketId: string;
  subject: string;
  message: string;
  createdBy: string;
};

export type TicketClassificationResult = {
  category: string;
  priority: string;
  sentiment: string;
  confidence: number;
};
