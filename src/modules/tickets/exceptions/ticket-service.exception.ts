export class TicketNotFoundException extends Error {
  constructor(id: string) {
    super(`Ticket with ID ${id} not found for the tenant`);
    this.name = 'TicketNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TicketNotFoundException);
    }
  }
}

export class AgentReviewForbiddenException extends Error {
  constructor() {
    super('Agent review forbidden');
    this.name = 'AgentReviewForbiddenException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentReviewForbiddenException);
    }
  }
}
