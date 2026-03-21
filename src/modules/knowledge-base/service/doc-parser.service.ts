import { Injectable, Logger } from '@nestjs/common';
import { DocParserInput } from '../types/doc-parser.type';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { AwsS3Service } from 'src/infra/aws/aws-s3.service';
import { TextCleanerService } from './text-cleaner.service';

@Injectable()
export class DocParserService {
  private readonly logger = new Logger(DocParserService.name);

  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly textCleanerService: TextCleanerService,
  ) {}

  private async parseTextFromPdf(
    fileBuffer: Buffer<ArrayBufferLike>,
  ): Promise<string> {
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }

    return fullText.replace(/\n+/g, ' ');
  }

  public async parseDoc(docPaserInput: DocParserInput): Promise<string> {
    const { tenantId, docId, fileKey } = docPaserInput;

    const fileBuffer = await this.s3Service.getFile(fileKey);

    this.logger.debug(`Parsing doc. DocID: ${docId}, TenantID: ${tenantId}`);
    const extractedText = await this.parseTextFromPdf(fileBuffer);

    if (!extractedText || extractedText.length === 0) {
      this.logger.error(
        `No text extracted. DocID: ${docId}, TenantID: ${tenantId}`,
      );
      throw new Error(
        `No text extracted. DocID: ${docId}, TenantID: ${tenantId}`,
      );
    }

    this.logger.debug(
      `Parsing completed. DocID: ${docId}, TenantID: ${tenantId}`,
    );

    const cleanedText = this.textCleanerService.clean({
      tenantId,
      docId,
      text: extractedText,
    });

    return cleanedText;
  }
}
