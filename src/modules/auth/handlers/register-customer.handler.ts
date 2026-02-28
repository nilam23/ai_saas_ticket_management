import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { AuthService } from '../service/auth.service';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from 'src/modules/user/exceptions';
import { TenantAlreadyExistsException } from 'src/modules/tenants/exceptions';
import { RegisterCustomerApiHandlerEvent } from '../types/api-handler-event.type';

@Injectable()
export class RegisterCustomerHandler extends BaseHttpHandler<
  RegisterCustomerApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(RegisterCustomerHandler.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  public async handle(
    event: RegisterCustomerApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { registerCustomerrInput, auditContext } = event;
    try {
      this.logger.log(
        `Handling request to register customer with email: ${registerCustomerrInput.email} for the tenant: ${registerCustomerrInput.tenantId}`,
      );
      await this.authService.registerCustomer(
        registerCustomerrInput,
        auditContext,
      );
      this.logger.log(
        `Customer registered successfully with email: ${registerCustomerrInput.email} for the tenant: ${registerCustomerrInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error registering customer with email: ${registerCustomerrInput.email} for the tenant: ${registerCustomerrInput.tenantId}. Error: ${message}`,
      );

      if (error instanceof UserAlreadyExistsException) {
        this.conflict(message);
      } else if (error instanceof TenantAlreadyExistsException) {
        this.conflict(message);
      }

      this.handleUnknownError(message);
    }
  }
}
