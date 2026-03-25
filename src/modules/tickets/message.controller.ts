import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { ReviewAiResponseDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { SenderType, UserRole } from '@prisma/client';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { ReviewAiResponseHandler } from './handlers/api/review-ai-response.handler';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessageHandler } from './handlers/api/create-message.handler';
import { FetchMessagesHandler } from './handlers/api/view-messages.handler';
import { FetchMessagesOutput } from './types/message.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets/:ticketId/messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private readonly reviewAiResponseHandler: ReviewAiResponseHandler,
    private readonly createMessageHandler: CreateMessageHandler,
    private readonly fetchMessagesHandler: FetchMessagesHandler,
  ) {}

  @Roles(UserRole.AGENT)
  @Patch(':messageId/review')
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

  @Roles(UserRole.CUSTOMER, UserRole.AGENT)
  @Post()
  createMessage(
    @Tenant() tenantId: string,
    @Param('ticketId') ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to create message. UserID: ${request.user.id}, TenantID: ${tenantId}`,
    );
    return this.createMessageHandler.handle({
      createMessageInput: {
        ticketId,
        senderId: request.user.id,
        senderType:
          request.user.role === UserRole.AGENT
            ? SenderType.AGENT
            : SenderType.CUSTOMER,
        content: createMessageDto.content,
      },
      auditContext: {
        tenantId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }

  @Get()
  fetchMessages(
    @Tenant() tenantId: string,
    @Param('ticketId') ticketId: string,
    @Req() request: Request,
  ): Promise<HttpResponse<FetchMessagesOutput[]>> {
    this.logger.log(
      `Request to fetch messages. TicketID: ${ticketId}, UserID: ${request.user.id}, TenantID: ${tenantId}`,
    );
    return this.fetchMessagesHandler.handle({
      fetchMessagesInput: {
        tenantId,
        ticketId,
        userId: request.user.id,
      },
    });
  }
}
