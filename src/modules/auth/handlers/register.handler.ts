import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { AuthService } from '../service/auth.service';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from 'src/modules/user/exceptions';
import { TenantAlreadyExistsException } from 'src/modules/tenants/exceptions';
import { RegisterApiHandlerEvent } from '../types/api-handler-event.type';

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
      this.logger.log(
        `Handling request to register user with email: ${registerInput.email} for the tenant: ${registerInput.tenantName}`,
      );
      await this.authService.registerUser(registerInput, auditContext);
      this.logger.log(
        `User registered successfully with email: ${registerInput.email} for the tenant: ${registerInput.tenantName}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error registering user with email: ${registerInput.email} for the tenant: ${registerInput.tenantName}: ${message}`,
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
