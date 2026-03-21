import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from 'src/modules/user/exceptions';
import { TenantAlreadyExistsException } from 'src/modules/tenants/exceptions';
import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { RegisterApiHandlerEvent } from '../../types/api-handler-event.type';
import { AuthService } from '../../service/auth.service';

@Injectable()
export class RegisterHandler extends BaseHttpHandler<
  RegisterApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  public async handle(
    event: RegisterApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { registerInput, auditContext } = event;
    try {
      this.logger.debug(
        `Handling request to register user. Email: ${registerInput.email}, Tenant: ${registerInput.tenantName}`,
      );
      await this.authService.registerUser(registerInput, auditContext);
      this.logger.debug(
        `User registered. Email: ${registerInput.email}, Tenant: ${registerInput.tenantName}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error registering user. Email: ${registerInput.email}, Tenant: ${registerInput.tenantName}, Error: ${message}`,
      );
      if (error instanceof UserAlreadyExistsException) {
        return this.conflict(message);
      } else if (error instanceof TenantAlreadyExistsException) {
        return this.conflict(message);
      }
      return this.internalServerError(message);
    }
  }
}
