import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { RegisterHandler } from './handlers/register.handler';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { UserSignInHandler } from './handlers/user-signin.handler';
import { RegisterDto } from './dto/register.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { Public } from 'src/shared/decorators/public-route.decorator';
import type { Request } from 'express';
import { RegisterCustomerHandler } from './handlers/register-customer.handler';
import { RegisterCustomerDto } from './dto/customer-register.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly userSignInHandler: UserSignInHandler,
    private readonly registerCustomerHandler: RegisterCustomerHandler,
  ) {}

  @Post('register')
  @Public()
  register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
  ): Promise<HttpResponse<void>> {
    this.logger.log(
      `Request to register user with email: ${registerDto.email} for the tenant: ${registerDto.tenantName}`,
    );
    return this.registerHandler.handle({
      registerInput: registerDto,
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(
    @Tenant() tenantId: string,
    @Body() userSignInDto: UserSignInDto,
    @Req() request: Request,
  ): Promise<HttpResponse<{ token: string }>> {
    this.logger.log(
      `Request to login user with email: ${userSignInDto.email} for the tenant: ${tenantId}`,
    );
    return this.userSignInHandler.handle({
      userSignInInput: { ...userSignInDto, tenantId },
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }

  @Post('register-customer')
  registerCustomer(
    @Tenant() tenantId: string,
    @Body() registerCustomerDto: RegisterCustomerDto,
    @Req() request: Request,
  ) {
    this.logger.log(
      `Request to register customer: ${registerCustomerDto.email} for the tenant: ${tenantId}`,
    );
    return this.registerCustomerHandler.handle({
      registerCustomerrInput: { ...registerCustomerDto, tenantId },
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
