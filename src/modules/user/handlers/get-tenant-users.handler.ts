import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { UserService } from '../service/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import { GetTenantUsersInput, GetTenantUsersOutput } from '../types/user.type';

@Injectable()
export class GetTenantUsersHandler extends BaseHttpHandler<
  GetTenantUsersInput,
  GetTenantUsersOutput
> {
  private readonly logger = new Logger(GetTenantUsersHandler.name);
  constructor(private readonly userService: UserService) {
    super();
  }

  public async handle(
    getTenantUsersInput: GetTenantUsersInput,
  ): Promise<HttpResponse<GetTenantUsersOutput>> {
    try {
      this.logger.log(
        `Handling request to fetch users for tenant: ${getTenantUsersInput.tenantId}`,
      );
      const users =
        await this.userService.getUsersByTenantId(getTenantUsersInput);
      this.logger.log(
        `Users fetched successfully for the tenant: ${getTenantUsersInput.tenantId}`,
      );
      return this.ok(users);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching users for the tenant: ${getTenantUsersInput.tenantId}. Error: ${message}`,
      );
      this.handleUnknownError(message);
    }
  }
}
