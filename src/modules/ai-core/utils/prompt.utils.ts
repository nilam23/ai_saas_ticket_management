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

    Return ONLY valid JSON.
    Do NOT wrap the response in markdown.
    Do NOT include \`\`\` or the word json.

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
