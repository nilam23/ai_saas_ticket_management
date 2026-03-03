export class TicketNotFoundException extends Error {
  constructor(id: string) {
    super(`Ticket with ID ${id} not found for the tenant`);
    this.name = 'TicketNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TicketNotFoundException);
    }
  }
}
