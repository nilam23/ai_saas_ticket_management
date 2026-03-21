import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { CreateAgentApiHandlerEvent } from '../../types/api-handler-event.type';
import { UserService } from '../../service/user.service';
import { UserAlreadyExistsException } from '../../exceptions';

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
      this.logger.debug(
        `Handling request to create agent. Email: ${createUserInput.email}, TenantID: ${createUserInput.tenantId}, AdminID: ${auditContext.actorUserId!}`,
      );
      await this.userService.createUser(createUserInput, auditContext);
      this.logger.debug(
        `Agent created successfully. Email: ${createUserInput.email}, TenantID: ${createUserInput.tenantId}`,
      );
      return this.created();
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error creating agent. Email: ${createUserInput.email}, TenantID: ${createUserInput.tenantId}, AdminID: ${auditContext.actorUserId!}, Error: ${message}`,
      );
      if (error instanceof UserAlreadyExistsException) {
        return this.conflict(message);
      }
      return this.internalServerError(message);
    }
  }
}
