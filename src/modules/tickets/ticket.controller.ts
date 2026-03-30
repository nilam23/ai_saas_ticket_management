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
import { CreateTicketHandler } from './handlers/api/create-ticket.handler';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { FetchTicketsHandler } from './handlers/api/get-tickets.handler';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketStatusHandler } from './handlers/api/update-ticket-status.handler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly createTicketHandler: CreateTicketHandler,
    private readonly fetchTicketsHandler: FetchTicketsHandler,
    private readonly updateTicketStatusHandler: UpdateTicketStatusHandler,
  ) {}

  @Roles(UserRole.CUSTOMER)
  @Post()
  createTicket(
    @Tenant() tenantId: string,
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to create ticket. CustomerID: ${request.user.id}, TenantID: ${tenantId}`,
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

  @Get()
  fetchTickets(@Tenant() tenantId: string, @Req() request: Request) {
    this.logger.log(
      `Request to fetch tickets. UserID: ${request.user.id}, TenantID: ${tenantId}`,
    );
    return this.fetchTicketsHandler.handle({
      fetchTicketsInput: {
        tenantId,
        userId: request.user.id,
        userRole: request.user.role,
      },
    });
  }

  @Patch(':ticketId/status')
  updateTicketStatus(
    @Tenant() tenantId: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
    @Param('ticketId') ticketId: string,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to update ticket status. TicketID: ${ticketId}, Status: ${updateTicketStatusDto.status}, UserID: ${request.user.id}, TenantID: ${tenantId}`,
    );
    return this.updateTicketStatusHandler.handle({
      updateTicketStatusInput: {
        tenantId,
        ticketId,
        status: updateTicketStatusDto.status,
      },
      auditContext: {
        actorUserId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
