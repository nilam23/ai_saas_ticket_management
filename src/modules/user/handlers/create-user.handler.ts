import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { UserService } from '../service/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from '../exceptions/user-service.exception';
import { CreateUserApiHandlerEvent } from '../types/api-handler-event.type';

@Injectable()
export class CreateUserHandler extends BaseHttpHandler<
  CreateUserApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(CreateUserHandler.name);
  constructor(private readonly userService: UserService) {
    super();
  }

  public async handle(
    event: CreateUserApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { createUserInput, auditContext } = event;

    try {
      this.logger.log(
        `Handling request to create user with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId}`,
      );
      await this.userService.createUser(createUserInput, auditContext);
      this.logger.log(
        `User created successfully with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error creating user with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId}: ${message}`,
      );

      if (error instanceof UserAlreadyExistsException) {
        this.conflict(message);
      }

      this.handleUnknownError(message);
    }
  }
}
