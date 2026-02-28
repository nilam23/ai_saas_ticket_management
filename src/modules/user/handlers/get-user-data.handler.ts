import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserNotFoundException } from '../exceptions';
import { normalizeError } from 'src/shared/utils/error.utils';
import { GetUserDataInput, GetUserDataOutput } from '../types/user.type';

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
      this.logger.log(
        `Handling request to fetch user data for: ${getUserDataInput.email}`,
      );
      const user = await this.userService.getUserData(getUserDataInput);
      this.logger.log(
        `User data fetched successfully for user: ${getUserDataInput.email}`,
      );
      return this.ok({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching data for the user: ${getUserDataInput.email}. Error: ${message}`,
      );

      if (error instanceof UserNotFoundException) {
        this.notFound(message);
      }

      this.handleUnknownError(message);
    }
  }
}
