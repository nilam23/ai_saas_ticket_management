import { Injectable, Logger } from '@nestjs/common';
import {
  BaseHttpHandler,
  HttpResponse,
} from '../../../shared/handlers/base-http.handler';
import { AuthService } from '../service/auth.service';
import { InvalidPasswordException } from '../exceptions';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserNotFoundException } from 'src/modules/user/exceptions';
import { UserSignInApiHandlerEvent } from '../types/api-handler-event.type';

@Injectable()
export class UserSignInHandler extends BaseHttpHandler<
  UserSignInApiHandlerEvent,
  { token: string }
> {
  private readonly logger = new Logger(UserSignInHandler.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  public async handle(
    event: UserSignInApiHandlerEvent,
  ): Promise<HttpResponse<{ token: string }>> {
    const { userSignInInput, auditContext } = event;
    try {
      this.logger.log(
        `Handling request to login user with email: ${userSignInInput.email} for the tenant: ${userSignInInput.tenantId}`,
      );
      const loginData = await this.authService.loginUser(
        userSignInInput,
        auditContext,
      );
      this.logger.log(
        `User logged in successfully with email: ${userSignInInput.email} for the tenant: ${userSignInInput.tenantId}`,
      );
      return this.ok(loginData);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error logging in user with email: ${userSignInInput.email} for the tenant: ${userSignInInput.tenantId}. Error: ${message}`,
      );

      if (error instanceof UserNotFoundException) {
        this.notFound(message);
      } else if (error instanceof InvalidPasswordException) {
        this.unauthorized(message);
      }

      this.handleUnknownError(message);
    }
  }
}
