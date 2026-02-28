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
import { Role } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { GetTenantUsersOutput } from './types/user.type';
import { CreateUserHandler } from './handlers/create-user.handler';
import { GetTenantUsersHandler } from './handlers/get-tenant-users.handler';
import { USER_DEFAULT_PASSWORD } from 'src/shared/utils/env-config.utils';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getTenantUsersHandler: GetTenantUsersHandler,
  ) {}

  @Post('users')
  createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to create user with email: ${createUserDto.email} for the tenant: ${request.user.tenantId}`,
    );
    return this.createUserHandler.handle({
      createUserInput: {
        ...createUserDto,
        tenantId: request.user.tenantId,
        password: USER_DEFAULT_PASSWORD,
        ...(createUserDto.role
          ? { role: createUserDto.role }
          : { role: Role.AGENT }),
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
