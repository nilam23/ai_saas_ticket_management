import { Injectable, Logger } from '@nestjs/common';
import { generateTicketClassificationPrompt } from '../../ai-core/utils/prompt.utils';
import { AiProviderService } from '../../ai-core/service/ai-provider.service';
import { AuditService } from 'src/modules/audit/service/audit.service';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { TicketService } from 'src/modules/tickets/service/ticket.service';
import { TicketClassificationInput, TicketClassificationRawResult } from '../types/ticket-classification.type';
import { TicketClassificationSchema } from '../types/ticket-classification.schema';

@Injectable()
export class TicketClassificationService {
  private readonly logger = new Logger(TicketClassificationService.name);

  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly ticketService: TicketService,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
  ) {}

  public async classifyTicket(
    classificationInput: TicketClassificationInput,
  ): Promise<void> {
    const { ticketId, subject, message } = classificationInput;

    this.logger.log(`Classifying the ticket ${ticketId}`);

    const prompt = generateTicketClassificationPrompt(subject, message);
    const aiResponse = await this.aiProviderService.generateText(prompt, {
      stop: ['Explanation:', 'Ticket Subject:', 'You are', '\n\n'],
    });
    const rawResponse = JSON.parse(aiResponse) as TicketClassificationRawResult;
    const validation = TicketClassificationSchema.safeParse(rawResponse);

    if (!validation.success) {
      this.logger.error(
        `Invalid AI classification. Error: ${validation.error}`,
      );
      throw new Error('AI classification validation failed');
    }

    this.logger.log(
      `Classification generated for the ticket ${ticketId}. Result: ${JSON.stringify(validation.data)}`,
    );

    await this.ticketService.updateTicket({
      tenantId: classificationInput.tenantId,
      ticketId: classificationInput.ticketId,
      ...validation.data,
    });

    const systemUser = await this.userService.getUserData({
      tenantId: classificationInput.tenantId,
      email: getTenantSystemUserEmail(classificationInput.tenantId),
    });

    this.logger.log(
      `System user fetched for the tenant ${classificationInput.tenantId}`,
    );

    await this.auditService.createAuditLog({
      tenantId: classificationInput.tenantId,
      actorUserId: systemUser.id,
      action: AuditLogAction.CLASSIFY_TICKET,
      entityType: AuditLogEntityType.TICKET,
      entityId: classificationInput.ticketId,
      afterState: { ...validation.data },
    });
  }
}
