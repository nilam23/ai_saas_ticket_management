import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { TenantDocUploadedEventHandler } from './handlers/kafka/tenant-doc-uploaded.handler';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { DocParserService } from './service/doc-parser.service';
import { AwsModule } from 'src/infra/aws/aws.module';

@Module({
  imports: [DatabaseModule, AuditModule, KafkaModule, AwsModule],
  controllers: [TenantDocUploadedEventHandler],
  providers: [DocParserService],
})
export class KnowledgeBaseModule {}
