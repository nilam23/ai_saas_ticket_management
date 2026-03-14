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
import { KnowledgeChunkRepository } from './repositories/knowledge-chunk.repository';
import { RetrieveContextEventHandler } from './handlers/kafka/retrieve-context.handler';
import { SemanticSearchService } from './service/semantic-search.service';
import { TenantModule } from '../tenants/tenant.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    AwsModule,
    AiCoreModule,
    TenantModule,
    AuditModule,
    UserModule,
  ],
  controllers: [TenantDocUploadedEventHandler, RetrieveContextEventHandler],
  providers: [
    KnowledgeIngestionService,
    DocParserService,
    TextCleanerService,
    TextChunkerService,
    EmbeddingsGeneratorService,
    KnowledgeChunkRepository,
    SemanticSearchService,
  ],
})
export class KnowledgeBaseModule {}
