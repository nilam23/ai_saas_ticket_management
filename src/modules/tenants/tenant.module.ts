import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TenantRepository } from './repository/tenant.repository';
import { TenantService } from './service/tenant.service';
import { AuditModule } from '../audit/audit.module';
import { TenantController } from './tenant.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AwsModule } from 'src/infra/aws/aws.module';
import { TenantDocRepository } from './repository/tenant-doc.repository';
import { TenantDocService } from './service/tenant-doc.service';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { UploadDocHandler } from './handlers/api/upload-doc.handler';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    AwsModule,
    KafkaModule,
  ],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantDocService,
    TenantRepository,
    TenantDocRepository,
    PrismaService,
    UploadDocHandler,
  ],
  exports: [TenantService, TenantRepository, TenantDocService],
})
export class TenantModule {}
