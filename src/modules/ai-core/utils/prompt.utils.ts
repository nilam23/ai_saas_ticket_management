import {
  TicketCategory,
  TicketPriority,
  TicketSentiment,
} from '@prisma/client';

export const generateTicketClassificationPrompt = (
  subject: string,
  description: string,
) => {
  return `
    You are a SaaS customer support classifier.

    Classify the ticket into:

    Categories: ${Object.values(TicketCategory).join(', ')}

    Priorities: ${Object.values(TicketPriority).join(', ')}

    Sentiment: ${Object.values(TicketSentiment).join(', ')}

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
