import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TenantNotFoundException } from 'src/modules/tenants/exceptions/tenant-service.exception';
import { TenantRepository } from 'src/modules/tenants/repository/tenant.repository';
import { PUBLIC_ROUTE_METADATA_KEY } from '../constants/common.constant';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);
  constructor(
    private tenantRepository: TenantRepository,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      this.logger.debug(
        `Public route, skipping tenant resolution. Route: '${(request.route as { path: string }).path}'`,
      );
      return true;
    }

    const host = request.headers.host;

    if (!host) {
      this.logger.error('Host is missing from request');
      throw new BadRequestException('Host is missing from request');
    }

    const hostname = host.split(':')[0];
    const [subdomain, domain] = hostname.split('.');

    if (!subdomain || !domain) {
      this.logger.error('Invalid tenant domain');
      throw new BadRequestException('Invalid tenant domain');
    }

    const tenant = await this.tenantRepository.findTenantBySlug(subdomain);

    if (!tenant) {
      this.logger.error(`Tenant with slug ${subdomain} not found`);
      throw new TenantNotFoundException(
        `Tenant with slug ${subdomain} not found`,
      );
    }

    request.tenantId = tenant.id;
    this.logger.debug(`Tenant resolved for request. TenantID: ${tenant.id}`);
    return true;
  }
}
