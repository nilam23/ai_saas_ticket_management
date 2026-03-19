import { Injectable, Logger } from '@nestjs/common';
import { TextCleanerInput } from '../types/text-cleaner.type';

@Injectable()
export class TextCleanerService {
  private readonly logger = new Logger(TextCleanerService.name);
  private readonly pipeline: Array<(text: string) => string> = [
    (text) => this.removeNullBytes(text),
    (text) => this.normalizeUnicode(text),
    (text) => this.removePageArtifacts(text),
    (text) => this.fixHyphenation(text),
    (text) => this.normalizeWhitespace(text),
    (text) => this.removeBoilerplate(text),
    (text) => this.fixEncoding(text),
  ];

  public clean(textCleanerInput: TextCleanerInput): string {
    const { tenantId, docId, text } = textCleanerInput;

    this.logger.debug(
      `Cleaning text. DocID: ${docId}, TenantID: ${tenantId}, Input length: ${text.length}`,
    );

    const cleanedText = this.pipeline.reduce((acc, fn) => fn(acc), text);

    this.logger.debug(
      `Cleaning completed. DocID: ${docId}, TenantID: ${tenantId}, Output length: ${cleanedText.length}`,
    );

    return cleanedText;
  }

  private removeNullBytes(text: string): string {
    const cleanedChars: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);

      if (charCode === 0x00) {
        continue;
      }

      const isControlChar = charCode <= 0x1f || charCode === 0x7f;
      const isAllowedControlChar =
        charCode === 0x09 || // \t
        charCode === 0x0a || // \n
        charCode === 0x0c || // \f
        charCode === 0x0d; // \r

      if (isControlChar && !isAllowedControlChar) {
        continue;
      }

      cleanedChars.push(text[i]);
    }

    return cleanedChars.join('');
  }

  private normalizeUnicode(text: string): string {
    return text
      .normalize('NFKC')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/\u00A0/g, ' ')
      .replace(/\u00AD/g, '');
  }

  private removePageArtifacts(text: string): string {
    return text
      .replace(/^Page\s+\d+\s+of\s+\d+$/gim, '')
      .replace(/^\d+\s*\|\s*P\s*a\s*g\s*e$/gim, '')
      .replace(/^-\s*\d+\s*-$/gim, '')
      .replace(/^\s*\d+\s*$/gm, '')
      .replace(/\f/g, '\n');
  }

  private fixHyphenation(text: string): string {
    return text
      .replace(/(\w)-\n(\w)/g, '$1$2')
      .replace(/(\w)-\r\n(\w)/g, '$1$2');
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '')
      .trim();
  }

  private removeBoilerplate(text: string): string {
    return text
      .replace(/^(confidential|draft|proprietary).*/gim, '')
      .replace(/all rights reserved.*/gi, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/^#{1,6}\s*/gm, '');
  }

  private fixEncoding(text: string): string {
    return text
      .replace(/Ã©/g, 'é')
      .replace(/Ã¨/g, 'è')
      .replace(/Ã /g, 'à')
      .replace(/Ã¢/g, 'â')
      .replace(/Ã®/g, 'î')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã»/g, 'û')
      .replace(/Ã§/g, 'ç')
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"');
  }
}
