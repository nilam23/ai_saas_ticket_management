import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { ReviewAiResponseDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { ReviewAiResponseHandler } from './handlers/api/review-ai-response.handler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly reviewAiResponseHandler: ReviewAiResponseHandler,
  ) {}

  @Roles(UserRole.AGENT)
  @Patch(':ticketId/messages/:messageId/review')
  reviewAiResponse(
    @Tenant() tenantId: string,
    @Param('ticketId') ticketId: string,
    @Param('messageId') messageId: string,
    @Body() reviewAiResponseDto: ReviewAiResponseDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to review AI generated response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${request.user.id}, TenantID: ${tenantId}`,
    );
    return this.reviewAiResponseHandler.handle({
      reviewAiResponseInput: {
        tenantId,
        ticketId,
        messageId,
        agentId: request.user.id,
        ...reviewAiResponseDto,
      },
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
