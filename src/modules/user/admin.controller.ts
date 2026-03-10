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
import { UserRole } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateAgentDto } from './dto/create-user.dto';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { GetTenantUsersOutput } from './types/user.type';
import { GetTenantUsersHandler } from './handlers/get-tenant-users.handler';
import { USER_DEFAULT_PASSWORD } from 'src/shared/utils/env-config.utils';
import { CreateAgentHandler } from './handlers/create-agent.handler';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly createAgentHandler: CreateAgentHandler,
    private readonly getTenantUsersHandler: GetTenantUsersHandler,
  ) {}

  @Post('users')
  createAgent(
    @Body() createAgentDto: CreateAgentDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to create agent with email: ${createAgentDto.email} for the tenant: ${request.user.tenantId}`,
    );
    return this.createAgentHandler.handle({
      createUserInput: {
        ...createAgentDto,
        tenantId: request.user.tenantId,
        password: USER_DEFAULT_PASSWORD,
        agentLevel: createAgentDto.level,
        agentSkills: createAgentDto.skills,
      },
      auditContext: {
        actorUserId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string,
      },
    });
  }

  @Get('users')
  getTenantUsers(
    @Req() request: Request,
  ): Promise<HttpResponse<GetTenantUsersOutput>> {
    this.logger.log(
      `Request to get users for the tenant: ${request.user.tenantId}`,
    );
    return this.getTenantUsersHandler.handle({
      tenantId: request.user.tenantId,
    });
  }
}
