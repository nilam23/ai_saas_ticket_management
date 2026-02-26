import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetUserDataHandler } from './handlers/get-user-data.handler';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { Request } from 'express';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { Role } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserHandler } from './handlers/create-user.handler';
import { USER_DEFAULT_PASSWORD } from 'src/shared/utils/env-config.utils';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { GetTenantUsersHandler } from './handlers/get-tenant-users.handler';
import { GetTenantUsersOutput, GetUserDataOutput } from './types/user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private readonly getUserDataHandler: GetUserDataHandler,
    private readonly createUserHandler: CreateUserHandler,
    private readonly getTenantUsersHandler: GetTenantUsersHandler,
  ) {}

  @Get('me')
  getUserData(
    @Req() request: Request,
  ): Promise<HttpResponse<GetUserDataOutput>> {
    this.logger.log(`Request to get user data for user: ${request.user.email}`);
    return this.getUserDataHandler.handle({
      email: request.user.email,
      tenantId: request.user.tenantId,
    });
  }

  @Post()
  @Roles(Role.ADMIN)
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
          : { role: Role.USER }),
      },
      auditContext: {
        actorUserId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string,
      },
    });
  }

  @Get()
  @Roles(Role.ADMIN)
  getTenantUsers(
    @Req() request: Request,
  ): Promise<HttpResponse<GetTenantUsersOutput>> {
    this.logger.log(
      `Request to get tenant users for tenant: ${request.user.tenantId}`,
    );
    return this.getTenantUsersHandler.handle({
      tenantId: request.user.tenantId,
    });
  }
}
