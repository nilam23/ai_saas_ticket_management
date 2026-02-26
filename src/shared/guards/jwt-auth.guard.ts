import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { JwtApplicationService } from 'src/modules/auth/service/jwt.service';
import { JwtPayload } from 'src/modules/user/types/user.type';
import { UserService } from 'src/modules/user/service/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly jwtService: JwtApplicationService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.error('Authorization header is missing');
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verifyToken(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.error('Token has expired');
        throw new UnauthorizedException('Token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        this.logger.error(`Invalid token: ${error.message}`);
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }

    const user = await this.userService.getUserData({
      email: decoded.email,
      tenantId: decoded.tenantId,
    });

    if (request.tenantId !== user.tenantId) {
      this.logger.error('User is not authorized to access this tenant');
      throw new UnauthorizedException('Unauthorized access');
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    };

    this.logger.log(
      `User ${user.email} authenticated for tenant ${request.tenantId}`,
    );
    return true;
  }
}
