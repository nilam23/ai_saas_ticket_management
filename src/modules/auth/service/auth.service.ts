import { Injectable, Logger } from '@nestjs/common';
import { InvalidPasswordException } from '../exceptions';
import { comparePassword } from 'src/modules/auth/utils/password.utils';
import { JwtApplicationService } from './jwt.service';
import { UserService } from 'src/modules/user/service/user.service';
import { TenantService } from 'src/modules/tenants/service/tenant.service';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'src/modules/user/types/user.type';
import {
  RegisterCustomerInput,
  RegisterInput,
  UserSignInInput,
} from '../types/auth.type';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { USER_DEFAULT_PASSWORD } from 'src/shared/utils/env-config.utils';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtApplicationService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService,
  ) {}

  public async registerUser(
    registerInput: RegisterInput,
    auditContext: AuditContext,
  ): Promise<void> {
    this.logger.log(
      `Registering user with email: ${registerInput.email} for the tenant: ${registerInput.tenantName}`,
    );

    const newTenant = await this.tenantService.createTenant({
      name: registerInput.tenantName,
    });

    this.logger.log(`Tenant created successfully. Tenant ID: ${newTenant.id}`);

    const [admin, systemUser] = await Promise.all([
      this.userService.createUser({
        name: registerInput.name,
        email: registerInput.email,
        password: registerInput.password,
        tenantId: newTenant.id,
        role: UserRole.ADMIN,
      }),
      this.userService.createUser({
        name: 'System',
        email: getTenantSystemUserEmail(newTenant.id),
        password: USER_DEFAULT_PASSWORD,
        tenantId: newTenant.id,
        role: UserRole.SYSTEM,
      }),
    ]);

    this.logger.log(
      `Admin and User created. Tenant: ${registerInput.tenantName}, Admin ID: ${admin.id}, System ID: ${systemUser.id}`,
    );

    await Promise.all([
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: admin.id,
        action: AuditLogAction.TENANT_CREATE,
        entityType: AuditLogEntityType.TENANT,
        entityId: newTenant.id,
        afterState: {
          id: newTenant.id,
          name: newTenant.name,
          slug: newTenant.slug,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      }),
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: admin.id,
        action: AuditLogAction.ADMIN_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: admin.id,
        afterState: { id: admin.id, email: registerInput.email },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      }),
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: systemUser.id,
        action: AuditLogAction.SYSTEM_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: systemUser.id,
        afterState: { id: systemUser.id, email: systemUser.email },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      }),
    ]);
  }

  public async loginUser(
    userSignInInput: UserSignInInput,
    auditContext: AuditContext,
  ): Promise<{ token: string }> {
    const user = await this.userService.getUserData({
      email: userSignInInput.email,
      tenantId: userSignInInput.tenantId,
    });

    this.logger.log(
      `User found with email: ${userSignInInput.email} and tenantId: ${userSignInInput.tenantId}`,
    );

    const isPasswordValid = await comparePassword(
      userSignInInput.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.error(
        `Invalid password for user with email ${userSignInInput.email} for the tenant: ${userSignInInput.tenantId}`,
      );
      throw new InvalidPasswordException();
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };
    const token = this.jwtService.generateToken(jwtPayload);

    this.logger.log(
      `User logged in successfully with email: ${userSignInInput.email} and tenantId: ${userSignInInput.tenantId}`,
    );

    await this.auditService.createAuditLog({
      tenantId: user.tenantId,
      actorUserId: user.id,
      action: AuditLogAction.LOGIN_ATTEMPT,
      entityType: AuditLogEntityType.USER,
      entityId: user.id,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    return { token };
  }

  public async registerCustomer(
    registerCustomerInput: RegisterCustomerInput,
    auditContext: AuditContext,
  ) {
    this.logger.log(
      `Registering customer with email: ${registerCustomerInput.email} for the tenant: ${registerCustomerInput.tenantId}`,
    );

    const { name, email, password, tenantId } = registerCustomerInput;
    const newCustomer = await this.userService.createUser({
      name,
      email,
      password,
      tenantId,
      role: UserRole.CUSTOMER,
    });

    this.logger.log(
      `Customer created successfully with email: ${registerCustomerInput.email} for the tenant: ${registerCustomerInput.tenantId}`,
    );

    await this.auditService.createAuditLog({
      tenantId: registerCustomerInput.tenantId,
      actorUserId: newCustomer.id,
      action: AuditLogAction.CUSTOMER_CREATE,
      entityType: AuditLogEntityType.USER,
      entityId: newCustomer.id,
      afterState: {
        id: newCustomer.id,
        email: registerCustomerInput.email,
        name: registerCustomerInput.name,
        role: UserRole.ADMIN,
        tenantId: registerCustomerInput.tenantId,
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });
  }
}
