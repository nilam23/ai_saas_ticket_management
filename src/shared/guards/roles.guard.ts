import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ROLES_KEY } from '../constants/common.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    this.logger.debug(
      `Verifying user access. Required roles: ${JSON.stringify(requiredRoles)}`,
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No required roles found, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      this.logger.error('User not authenticated');
      throw new ForbiddenException('Forbidden');
    }

    if (!requiredRoles.includes(user.role)) {
      this.logger.error(
        `User does not have required role. Email: ${user.email}, Required roles: ${JSON.stringify(requiredRoles)}`,
      );
      throw new ForbiddenException('Forbidden');
    }

    this.logger.debug(
      `User has the required role, allowing access. Email: ${user.email}, User role: ${user.role}`,
    );
    return true;
  }
}
