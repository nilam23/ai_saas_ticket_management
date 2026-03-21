import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserNotFoundException } from 'src/modules/user/exceptions';
import { UserSignInApiHandlerEvent } from '../../types/api-handler-event.type';
import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { AuthService } from '../../service/auth.service';
import { InvalidPasswordException } from '../../exceptions';

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
      this.logger.debug(
        `Handling request to login user. Email: ${userSignInInput.email}, TenantId: ${userSignInInput.tenantId}`,
      );
      const loginData = await this.authService.loginUser(
        userSignInInput,
        auditContext,
      );
      this.logger.debug(
        `User logged in successfully. Email: ${userSignInInput.email}, TenantId: ${userSignInInput.tenantId}`,
      );
      return this.ok(loginData);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error logging in user. Email: ${userSignInInput.email}, TenantId: ${userSignInInput.tenantId}. Error: ${message}`,
      );
      if (error instanceof UserNotFoundException) {
        return this.notFound(message);
      } else if (error instanceof InvalidPasswordException) {
        return this.unauthorized(message);
      }
      return this.internalServerError(message);
    }
  }
}
