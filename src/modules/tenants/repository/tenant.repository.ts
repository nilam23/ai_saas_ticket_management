import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { createSlug } from 'src/shared/utils/common.utils';
import { TenantAlreadyExistsException } from '../exceptions';
import { normalizeError } from 'src/shared/utils/error.utils';
import { CreateTenantInput } from '../types/tenant.type';

@Injectable()
export class TenantRepository {
  private readonly logger = new Logger(TenantRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async createTenant(
    createTenantInput: CreateTenantInput,
  ): Promise<Tenant> {
    try {
      const tenantData: Prisma.TenantCreateInput = {
        name: createTenantInput.name,
        slug: createSlug(createTenantInput.name),
      };

      const tenant = await this.prisma.tenant.create({
        data: tenantData,
      });

      return tenant;
    } catch (error) {
      this.logger.error(
        `Error creating tenant: ${normalizeError(error).message}`,
      );

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.error('Tenant already exists');
        throw new TenantAlreadyExistsException();
      }

      throw error;
    }
  }

  public async findTenantBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }
}
