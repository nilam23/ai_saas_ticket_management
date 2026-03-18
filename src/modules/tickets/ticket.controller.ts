import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateTicketHandler } from './handlers/create-ticket.handler';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { CreateTicketDto, ReviewAiResponseDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ReviewAiResponseHandler } from './handlers/review-ai-response.handler';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly createTicketHandler: CreateTicketHandler,
    private readonly reviewAiResponseHandler: ReviewAiResponseHandler,
  ) {}

  @Roles(UserRole.CUSTOMER)
  @Post()
  createTicket(
    @Tenant() tenantId: string,
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to create ticket by customer: ${request.user.id} for the tenant: ${tenantId}`,
    );
    return this.createTicketHandler.handle({
      createTicketInput: {
        tenantId,
        createdById: request.user.id,
        subject: createTicketDto.subject,
        message: createTicketDto.message,
      },
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }

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
      `Request to review AI generated response. MessageID: ${messageId}, TicketID: ${ticketId}, AgentID: ${request.user.id}`,
    );
    return this.reviewAiResponseHandler.handle({
      reviewAiResponseInput: {
        tenantId,
        ticketId,
        messageId,
        ...reviewAiResponseDto,
      },
      auditContext: {
        actorUserId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
