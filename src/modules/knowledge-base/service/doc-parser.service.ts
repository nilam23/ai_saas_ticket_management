import { Injectable, Logger } from '@nestjs/common';
import { DocParserInput } from '../types/doc-parser.type';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

@Injectable()
export class DocParserService {
  private readonly logger = new Logger(DocParserService.name);

  constructor() {}

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

  public async extractDocText(docPaserInput: DocParserInput): Promise<string> {
    const { docId, fileBuffer } = docPaserInput;

    this.logger.log(`Extracting text from the doc ${docId}`);
    const extractedText = await this.parseTextFromPdf(fileBuffer);
    this.logger.log(`Text extraction successful for the doc ${docId}`);

    return extractedText;
  }
}
