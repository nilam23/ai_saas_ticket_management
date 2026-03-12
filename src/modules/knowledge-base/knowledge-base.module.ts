import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { TenantDocUploadedEventHandler } from './handlers/kafka/tenant-doc-uploaded.handler';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { DocParserService } from './service/doc-parser.service';
import { AwsModule } from 'src/infra/aws/aws.module';
import { KnowledgeIngestionService } from './service/knowledge-ingestion.service';
import { TextCleanerService } from './service/text-cleaner.service';
import { TextChunkerService } from './service/text-chunker.service';

@Module({
  imports: [DatabaseModule, AuditModule, KafkaModule, AwsModule],
  controllers: [TenantDocUploadedEventHandler],
  providers: [
    KnowledgeIngestionService,
    DocParserService,
    TextCleanerService,
    TextChunkerService,
  ],
})
export class KnowledgeBaseModule {}
