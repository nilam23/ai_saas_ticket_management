import { Injectable, Logger } from '@nestjs/common';
import { IngestDocInput } from '../types/knowledge-ingestion.type';
import { DocParserService } from './doc-parser.service';
import { AwsS3Service } from 'src/infra/aws/aws-s3.service';
import { TextCleanerService } from './text-cleaner.service';
import { TextChunkerService } from './text-chunker.service';

@Injectable()
export class KnowledgeIngestionService {
  private readonly logger = new Logger(KnowledgeIngestionService.name);

  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly docParserService: DocParserService,
    private readonly textCleanerService: TextCleanerService,
    private readonly textChunkerService: TextChunkerService,
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

    const docChunks = this.textChunkerService.chunkText({
      docId,
      text: cleanedText,
      options: { chunkSize: 500, chunkOverlap: 100 },
    });

    this.logger.log(
      `Generated ${docChunks.length} chunks for document ${docId}`,
    );

    this.logger.log(
      `Ingestion completed for the doc ${docId} of the tenant ${tenantId}`,
    );

    return;
  }
}
