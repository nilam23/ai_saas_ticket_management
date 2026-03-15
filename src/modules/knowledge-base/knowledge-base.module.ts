import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { DocParserService } from './service/doc-parser.service';
import { AwsModule } from 'src/infra/aws/aws.module';
import { KnowledgeIngestionService } from './service/knowledge-ingestion.service';
import { TextCleanerService } from './service/text-cleaner.service';
import { TextChunkerService } from './service/text-chunker.service';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { EmbeddingsGeneratorService } from './service/embeddings-generator.service';
import { KnowledgeChunkRepository } from './repositories/knowledge-chunk.repository';
import { SemanticSearchService } from './service/semantic-search.service';
import { TenantModule } from '../tenants/tenant.module';
import { UserModule } from '../user/user.module';
import { TenantDocParserEventHandler } from './handlers/kafka/parse-doc.handler';
import { TenantDocTextChunkerEventHandler } from './handlers/kafka/chunk-doc-text.handler';
import { TenantDocEmbeddingGeneratorEventHandler } from './handlers/kafka/generate-doc-embedding.handler';
import { TenantDocIngestionFinalizationEventHandler } from './handlers/kafka/ingestion-finalization.handler';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    KafkaModule,
    AwsModule,
    AiCoreModule,
    TenantModule,
    forwardRef(() => UserModule),
  ],
  controllers: [
    TenantDocParserEventHandler,
    TenantDocTextChunkerEventHandler,
    TenantDocEmbeddingGeneratorEventHandler,
    TenantDocIngestionFinalizationEventHandler,
  ],
  providers: [
    KnowledgeIngestionService,
    DocParserService,
    TextCleanerService,
    TextChunkerService,
    EmbeddingsGeneratorService,
    KnowledgeChunkRepository,
    SemanticSearchService,
  ],
  exports: [SemanticSearchService],
})
export class KnowledgeBaseModule {}
