import {
  Body,
  Controller,
  Get,
  Logger,
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly createTicketHandler: CreateTicketHandler,
    private readonly fetchTicketsHandler: FetchTicketsHandler,
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
}
