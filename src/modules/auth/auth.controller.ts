import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { HttpResponse } from 'src/shared/handlers/base-http.handler';
import { RegisterDto } from './dto/register.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { Tenant } from 'src/shared/decorators/tenant.decorator';
import { Public } from 'src/shared/decorators/public-route.decorator';
import type { Request } from 'express';
import { RegisterCustomerHandler } from './handlers/api/register-customer.handler';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterHandler } from './handlers/api/register.handler';
import { UserSignInHandler } from './handlers/api/user-signin.handler';

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
      `Request to register user. Email: ${registerDto.email}, TenantID: ${registerDto.tenantName}`,
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
      `Request to login user. Email: ${userSignInDto.email}, TenantID: ${tenantId}`,
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
      `Request to register customer. Email: ${registerCustomerDto.email}, TenantID: ${tenantId}`,
    );
    return this.registerCustomerHandler.handle({
      registerCustomerInput: { ...registerCustomerDto, tenantId },
      auditContext: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}
