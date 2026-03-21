import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../../shared/handlers/base-http.handler';
import { AuthService } from '../../service/auth.service';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from 'src/modules/user/exceptions';
import { RegisterCustomerApiHandlerEvent } from '../../types/api-handler-event.type';

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
    const { registerCustomerInput, auditContext } = event;
    try {
      this.logger.debug(
        `Handling request to register customer. Email: ${registerCustomerInput.email}, TenantID: ${registerCustomerInput.tenantId}`,
      );
      await this.authService.registerCustomer(
        registerCustomerInput,
        auditContext,
      );
      this.logger.debug(
        `Customer registered. Email: ${registerCustomerInput.email}, TenantID: ${registerCustomerInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error registering customer. Email: ${registerCustomerInput.email}, TenantID: ${registerCustomerInput.tenantId}, Error: ${message}`,
      );
      if (error instanceof UserAlreadyExistsException) {
        return this.conflict(message);
      }
      return this.internalServerError(message);
    }
  }
}
