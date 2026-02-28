import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { GetUserDataHandler } from './handlers/get-user-data.handler';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { Request } from 'express';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { GetUserDataOutput } from './types/user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly getUserDataHandler: GetUserDataHandler) {}

  @Get('me')
  getUserData(
    @Req() request: Request,
  ): Promise<HttpResponse<GetUserDataOutput>> {
    this.logger.log(`Request to get data for the user: ${request.user.email}`);
    return this.getUserDataHandler.handle({
      email: request.user.email,
      tenantId: request.user.tenantId,
    });
  }
}
