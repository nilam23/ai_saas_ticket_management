import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TenantRepository } from './repository/tenant.repository';
import { TenantService } from './service/tenant.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DatabaseModule, AuditModule],
  providers: [TenantService, TenantRepository, PrismaService],
  exports: [TenantService, TenantRepository],
})
export class TenantsModule {}
