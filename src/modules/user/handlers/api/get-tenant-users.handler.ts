import {
  BaseHttpHandler,
  HttpResponse,
} from 'src/shared/handlers/base-http.handler';
import { Injectable, Logger } from '@nestjs/common';
import { normalizeError } from 'src/shared/utils/error.utils';
import {
  GetTenantUsersInput,
  GetTenantUsersOutput,
} from '../../types/user.type';
import { UserService } from '../../service/user.service';

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
      this.logger.debug(
        `Handling request to fetch tenant users. TenantID: ${getTenantUsersInput.tenantId}`,
      );
      const users =
        await this.userService.getUsersByTenantId(getTenantUsersInput);
      this.logger.debug(
        `Tenant users fetched successfully. TenantID: ${getTenantUsersInput.tenantId}`,
      );
      return this.ok(users);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.error(
        `Error fetching users. TenantID: ${getTenantUsersInput.tenantId}, Error: ${message}`,
      );
      return this.internalServerError(message);
    }
  }
}
