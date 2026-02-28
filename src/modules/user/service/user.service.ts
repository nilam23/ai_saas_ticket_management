import { UserRepository } from '../repository/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions';
import {
  CreateUserInput,
  GetTenantUsersInput,
  GetTenantUsersOutput,
  GetUserDataInput,
} from '../types/user.type';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { AuditContext } from 'src/modules/audit/types/audit.type';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  public async getUserData(getUserDataInput: GetUserDataInput): Promise<User> {
    this.logger.log(
      `Getting user data for email: ${getUserDataInput.email} and tenantId: ${getUserDataInput.tenantId}`,
    );
    const user = await this.userRepository.findUserByEmail(getUserDataInput);

    if (!user) {
      this.logger.error(
        `User with email: ${getUserDataInput.email} not found for the tenant: ${getUserDataInput.tenantId}`,
      );
      throw new UserNotFoundException(getUserDataInput.email);
    }

    return user;
  }

  public async createUser(
    createUserInput: CreateUserInput,
    auditContext?: AuditContext,
  ): Promise<User> {
    this.logger.log(
      `Checking if user with email: ${createUserInput.email} already exists for the tenant: ${createUserInput.tenantId}`,
    );
    const user = await this.userRepository.findUserByEmail(createUserInput);

    if (user) {
      this.logger.error(
        `User with email ${createUserInput.email} already exists for the tenant: ${createUserInput.tenantId}`,
      );
      throw new UserAlreadyExistsException(createUserInput.email);
    }

    this.logger.log(
      `Creating user with email: ${createUserInput.email} for the tenant: ${createUserInput.tenantId}`,
    );
    const newUser = await this.userRepository.createUser(createUserInput);

    if (auditContext) {
      await this.auditService.createAuditLog({
        tenantId: createUserInput.tenantId,
        actorUserId: auditContext.actorUserId!,
        action:
          createUserInput.role === Role.ADMIN
            ? AuditLogAction.ADMIN_CREATE
            : AuditLogAction.AGENT_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: newUser.id,
        afterState: {
          id: newUser.id,
          email: createUserInput.email,
          name: createUserInput.name,
          role: createUserInput.role,
          tenantId: createUserInput.tenantId,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }

    return newUser;
  }

  public async getUsersByTenantId(
    getTenantUsersInput: GetTenantUsersInput,
  ): Promise<GetTenantUsersOutput> {
    this.logger.log(
      `Getting users for the tenant: ${getTenantUsersInput.tenantId}`,
    );
    return this.userRepository.getUsersByTenantId(getTenantUsersInput.tenantId);
  }
}
