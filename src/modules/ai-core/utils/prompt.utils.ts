import {
  TicketClassificationCategories,
  TicketClassificationPriorities,
  TicketClassificationSentiments,
} from '../constants/ticket-classification.constant';

export const generateTicketClassificationPrompt = (
  subject: string,
  description: string,
) => {
  return `
    You are a SaaS customer support classifier.

    Classify the ticket into:

    Categories: ${TicketClassificationCategories.join(', ')}

    Priorities: ${TicketClassificationPriorities.join(', ')}

    Sentiment: ${TicketClassificationSentiments.join(', ')}

    Return only valid JSON response.
    Do not wrap the response in markdown or code blocks.

    {
      "category": "",
      "priority": "",
      "sentiment": "",
      "confidence": 0.0
    }

    Ticket Subject:
    ${subject}

    Ticket Description:
    ${description}
  `;
};
