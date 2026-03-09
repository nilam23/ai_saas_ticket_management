import { TicketPriority } from "@prisma/client";
import { AllowedTicketCategories, AllowedTicketSentiments } from "src/modules/tickets/enums/ticket.enum";

export const generateTicketClassificationPrompt = (
  subject: string,
  description: string,
) => {
  return `
    You are a SaaS customer support classifier.

    Classify the ticket into:

    Categories: ${Object.values(AllowedTicketCategories).join(', ')}

    Priorities: ${Object.values(TicketPriority).join(', ')}

    Sentiment: ${Object.values(AllowedTicketSentiments).join(', ')}

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
