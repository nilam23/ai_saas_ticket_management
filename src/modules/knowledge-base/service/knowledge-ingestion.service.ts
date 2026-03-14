import { Injectable, Logger } from '@nestjs/common';
import { IngestDocInput } from '../types/knowledge-ingestion.type';
import { DocParserService } from './doc-parser.service';
import { AwsS3Service } from 'src/infra/aws/aws-s3.service';
import { TextCleanerService } from './text-cleaner.service';
import { TextChunkerService } from './text-chunker.service';
import { EmbeddingsGeneratorService } from './embeddings-generator.service';
import { KnowledgeChunkRepository } from '../repositories/knowledge-chunk.repository';
import { TenantDocService } from 'src/modules/tenants/service/tenant-doc.service';
import { DocStatus } from '@prisma/client';
import { AuditService } from 'src/modules/audit/service/audit.service';
import { UserService } from 'src/modules/user/service/user.service';
import { getTenantSystemUserEmail } from 'src/shared/utils/common.utils';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';

@Injectable()
export class KnowledgeIngestionService {
  private readonly logger = new Logger(KnowledgeIngestionService.name);

  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly docParserService: DocParserService,
    private readonly textCleanerService: TextCleanerService,
    private readonly textChunkerService: TextChunkerService,
    private readonly embeddingsGeneratorService: EmbeddingsGeneratorService,
    private readonly knowledgeChunkRepository: KnowledgeChunkRepository,
    private readonly tenantDocService: TenantDocService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  public async ingestDocument(ingestDocInput: IngestDocInput): Promise<void> {
    const { tenantId, docId, fileKey } = ingestDocInput;

    this.logger.log(
      `Starting ingestion for doc ${docId} of the tenant ${tenantId}`,
    );

    const fileBuffer = await this.s3Service.getFile(fileKey);

    const extractedText = await this.docParserService.extractDocText({
      docId: docId,
      fileBuffer,
    });

    if (!extractedText || extractedText.length === 0) {
      this.logger.error(`No text extracted for document ${docId}`);
      return;
    }

    const cleanedText = this.textCleanerService.clean({
      docId,
      text: extractedText,
    });

    const chunks = this.textChunkerService.chunkText({
      docId,
      text: cleanedText,
      options: { chunkSize: 500, chunkOverlap: 100 },
    });

    this.logger.log(`Generated ${chunks.length} chunks for document ${docId}`);

    const embeddings = await this.embeddingsGeneratorService.generateEmbeddings(
      { docId, chunks },
    );

    this.logger.log(`Storing embeddings for the doc ${docId}`);

    const knowledgeChunksRecords = chunks.map((chunk) => ({
      tenantId,
      docId,
      chunkIndex: chunk.index,
      content: chunk.content,
      embedding: embeddings[chunk.index],
    }));

    await this.knowledgeChunkRepository.createKnowledgeChunks(
      knowledgeChunksRecords,
    );

    this.logger.log(`Embeddings stored successfully for the doc ${docId}`);

    await this.tenantDocService.updateTenantDoc({
      docId,
      tenantId,
      status: DocStatus.PROCESSED,
    });

    const systemUser = await this.userService.getUserData({
      tenantId,
      email: getTenantSystemUserEmail(tenantId),
    });

    this.logger.log(`System user fetched for the tenant ${tenantId}`);

    await this.auditService.createAuditLog({
      tenantId,
      actorUserId: systemUser.id,
      action: AuditLogAction.DOC_KNOWLEDGE_INGEST,
      entityType: AuditLogEntityType.TENANT_DOC,
      entityId: docId,
      afterState: { status: DocStatus.PROCESSED },
    });

    this.logger.log(
      `Ingestion completed for the doc ${docId} of the tenant ${tenantId}`,
    );

    return;
  }
}
