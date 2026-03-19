import { Tenant } from '@prisma/client';
import { TenantRepository } from '../repository/tenant.repository';
import { Injectable, Logger } from '@nestjs/common';
import { CreateTenantInput } from '../types/tenant.type';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly tenantRepository: TenantRepository) {}

  public async createTenant(
    createTenantInput: CreateTenantInput,
  ): Promise<Tenant> {
    this.logger.debug(
      `Creating tenant. Tenant Name: ${createTenantInput.name}`,
    );
    const newTenant =
      await this.tenantRepository.createTenant(createTenantInput);
    return newTenant;
  }
}
