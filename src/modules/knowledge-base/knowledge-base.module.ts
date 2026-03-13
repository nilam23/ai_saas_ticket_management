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
import { AiCoreModule } from '../ai-core/ai-core.module';
import { EmbeddingsGeneratorService } from './service/embeddings-generator.service';
import { KnowledgeChunksRepository } from './repositories/knowledge-chunk.repository';

@Module({
  imports: [DatabaseModule, AuditModule, KafkaModule, AwsModule, AiCoreModule],
  controllers: [TenantDocUploadedEventHandler],
  providers: [
    KnowledgeIngestionService,
    DocParserService,
    TextCleanerService,
    TextChunkerService,
    EmbeddingsGeneratorService,
    KnowledgeChunksRepository,
  ],
})
export class KnowledgeBaseModule {}
