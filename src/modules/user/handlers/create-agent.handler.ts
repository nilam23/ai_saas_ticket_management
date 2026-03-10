import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { UserService } from '../service/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { UserAlreadyExistsException } from '../exceptions/user-service.exception';
import { CreateAgentApiHandlerEvent } from '../types/api-handler-event.type';

@Injectable()
export class CreateAgentHandler extends BaseHttpHandler<
  CreateAgentApiHandlerEvent,
  void
> {
  private readonly logger = new Logger(CreateAgentHandler.name);
  constructor(private readonly userService: UserService) {
    super();
  }

  public async handle(
    event: CreateAgentApiHandlerEvent,
  ): Promise<HttpResponse<void>> {
    const { createUserInput, auditContext } = event;

    try {
      this.logger.log(
        `Handling request to create agent with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId} by ${auditContext.actorUserId!}`,
      );
      await this.userService.createUser(createUserInput, auditContext);
      this.logger.log(
        `Agent created successfully with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error creating agent with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId} by ${auditContext.actorUserId!}. Error: ${message}`,
      );

      if (error instanceof UserAlreadyExistsException) {
        this.conflict(message);
      }

      this.handleUnknownError(message);
    }
  }
}
