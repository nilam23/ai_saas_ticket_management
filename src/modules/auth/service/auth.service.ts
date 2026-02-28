import { Injectable, Logger } from '@nestjs/common';
import { InvalidPasswordException } from '../exceptions';
import { comparePassword } from 'src/modules/auth/utils/password.utils';
import { JwtApplicationService } from './jwt.service';
import { UserService } from 'src/modules/user/service/user.service';
import { TenantService } from 'src/modules/tenants/service/tenant.service';
import { Role } from '@prisma/client';
import { JwtPayload } from 'src/modules/user/types/user.type';
import { RegisterInput, UserSignInInput } from '../types/auth.type';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { AuditContext } from 'src/modules/audit/types/audit.type';

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

    const newUser = await this.userService.createUser({
      name: registerInput.name,
      email: registerInput.email,
      password: registerInput.password,
      tenantId: newTenant.id,
      role: Role.ADMIN,
    });

    this.logger.log(
      `User created successfully with email: ${registerInput.email} for the tenant: ${registerInput.tenantName}`,
    );

    await Promise.all([
      this.auditService.createAuditLog({
        tenantId: newTenant.id,
        actorUserId: newUser.id,
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
        actorUserId: newUser.id,
        action: AuditLogAction.ADMIN_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: newUser.id,
        afterState: {
          id: newUser.id,
          email: registerInput.email,
          name: registerInput.name,
          role: Role.ADMIN,
          tenantId: newTenant.id,
        },
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
}
