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
    const { name, email, password, tenantName } = registerInput;
    const { ipAddress, userAgent } = auditContext;

    this.logger.debug(
      `Registering user. Email: ${email}, Tenant: ${tenantName}`,
    );

    const newTenant = await this.tenantService.createTenant({
      name: tenantName,
    });

    this.logger.debug(`Tenant created. TenantID: ${newTenant.id}`);

    const [admin, systemUser] = await Promise.all([
      this.userService.createUser({
        name,
        email,
        password,
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

    this.logger.debug(
      `Admin and System User created. AdminID: ${admin.id}, SystemUserID: ${systemUser.id}, TenantID: ${newTenant.id}`,
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
        ipAddress,
        userAgent,
      }),
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: admin.id,
        action: AuditLogAction.ADMIN_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: admin.id,
        afterState: { id: admin.id, email: email },
        ipAddress,
        userAgent,
      }),
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: systemUser.id,
        action: AuditLogAction.SYSTEM_USER_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: systemUser.id,
        afterState: { id: systemUser.id, email: systemUser.email },
        ipAddress,
        userAgent,
      }),
    ]);

    this.logger.debug(
      `User and Tenant registration successful. User Email: ${email}, Tenant: ${tenantName}, TenantID: ${newTenant.id}`,
    );
  }

  public async loginUser(
    userSignInInput: UserSignInInput,
    auditContext: AuditContext,
  ): Promise<{ token: string }> {
    const { tenantId, email, password } = userSignInInput;
    const { ipAddress, userAgent } = auditContext;

    const user = await this.userService.getUserData({
      email,
      tenantId,
    });

    this.logger.debug(`User found. Email: ${email}, TenantId: ${tenantId}`);

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.error(
        `Invalid password for user. Email ${email}, TenantID: ${tenantId}`,
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

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: user.id,
      action: AuditLogAction.LOGIN_ATTEMPT,
      entityType: AuditLogEntityType.USER,
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    this.logger.debug(
      `User logged in successfully. Email ${email}, TenantID: ${tenantId}`,
    );

    return { token };
  }

  public async registerCustomer(
    registerCustomerInput: RegisterCustomerInput,
    auditContext: AuditContext,
  ): Promise<void> {
    const { name, email, password, tenantId } = registerCustomerInput;
    const { ipAddress, userAgent } = auditContext;

    this.logger.debug(
      `Registering customer. Email ${email}, TenantID: ${tenantId}`,
    );

    const newCustomer = await this.userService.createUser({
      name,
      email,
      password,
      tenantId,
      role: UserRole.CUSTOMER,
    });

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: newCustomer.id,
      action: AuditLogAction.CUSTOMER_CREATE,
      entityType: AuditLogEntityType.USER,
      entityId: newCustomer.id,
      afterState: {
        id: newCustomer.id,
        email,
        name,
        role: UserRole.ADMIN,
        tenantId,
      },
      ipAddress,
      userAgent,
    });

    this.logger.debug(
      `Customer created. Email ${email}, TenantID: ${tenantId}`,
    );
  }
}
