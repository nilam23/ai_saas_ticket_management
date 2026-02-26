import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditRepository } from './repository/audit.repository';
import { AuditService } from './service/audit.service';

@Module({
  imports: [DatabaseModule],
  providers: [AuditService, AuditRepository],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
