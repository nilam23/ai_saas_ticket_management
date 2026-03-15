import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateTicketHandler } from './handlers/create-ticket.handler';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GenerateAiResponseHandler } from './handlers/generate-ai-response.handler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly createTicketHandler: CreateTicketHandler,
    private readonly generateAiResponseHandler: GenerateAiResponseHandler,
  ) {}

  @Post()
  createTicket(
    @Tenant() tenantId: string,
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: Request,
  ) {
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
  @Get(':ticketId/knowledge-search')
  getTicketAiResponse(
    @Tenant() tenantId: string,
    @Param('ticketId') ticketId: string,
    @Query('query') query: string,
    @Req() request: Request,
  ) {
    this.logger.log(
      `Request to generate AI response. TicketID: ${ticketId}, AgentID: ${request.user.id} TenantID: ${tenantId}`,
    );
    return this.generateAiResponseHandler.handle({
      generateAiResponseInput: {
        tenantId,
        ticketId,
        query,
      },
      auditContext: {
        actorUserId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
