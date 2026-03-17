import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateTicketHandler } from './handlers/create-ticket.handler';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(private readonly createTicketHandler: CreateTicketHandler) {}

  @Roles(UserRole.CUSTOMER)
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
}
