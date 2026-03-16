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
    this.logger.log(
      `Checking if user has required roles: ${requiredRoles.join(', ')}`,
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.log('No required roles found, allowing access');
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
        `User ${user.email} does not have required role ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException('Forbidden');
    }

    this.logger.log(
      `User ${user.email} has the required role ${user.role}. Allowing access`,
    );
    return true;
  }
}
