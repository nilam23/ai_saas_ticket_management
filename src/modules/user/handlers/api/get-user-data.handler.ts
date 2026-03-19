import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { GetUserDataInput, GetUserDataOutput } from '../../types/user.type';
import { UserService } from '../../service/user.service';
import { UserNotFoundException } from '../../exceptions';

@Injectable()
export class GetUserDataHandler extends BaseHttpHandler<
  GetUserDataInput,
  GetUserDataOutput
> {
  private readonly logger = new Logger(GetUserDataHandler.name);
  constructor(private readonly userService: UserService) {
    super();
  }

  public async handle(
    getUserDataInput: GetUserDataInput,
  ): Promise<HttpResponse<GetUserDataOutput>> {
    try {
      this.logger.debug(
        `Handling request to fetch user data. Email: ${getUserDataInput.email}`,
      );
      const user = await this.userService.getUserData(getUserDataInput);
      this.logger.debug(
        `User data fetched successfully. Email: ${getUserDataInput.email}`,
      );
      return this.ok({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agentLevel: user.agentLevel,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching user data. Email: ${getUserDataInput.email}. Error: ${message}`,
      );

      if (error instanceof UserNotFoundException) {
        return this.notFound(message);
      }

      return this.internalServerError(message);
    }
  }
}
