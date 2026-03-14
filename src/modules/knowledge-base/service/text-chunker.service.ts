import { Injectable, Logger } from '@nestjs/common';
import { ChunkTextInput, TextChunk } from '../types/text-chunker.type';

@Injectable()
export class TextChunkerService {
  private readonly logger = new Logger(TextChunkerService.name);
  private readonly DEFAULT_SEPARATORS = ['\n\n', '\n', '.', ' ', ''];

  constructor() {}

  public chunkText(chunkTextInput: ChunkTextInput): TextChunk[] {
    const { tenantId, docId, text, options } = chunkTextInput;
    const { chunkSize, chunkOverlap } = options;
    const separators = options.separators ?? this.DEFAULT_SEPARATORS;

    this.logger.log(
      `Chunking text. DocID: ${docId}, TenantID: ${tenantId}, Text length: ${text.length}, Chunk Size: ${chunkSize}, Overlap: ${chunkOverlap}`,
    );

    if (chunkOverlap >= chunkSize) {
      throw new Error('chunkOverlap must be less than chunkSize');
    }

    const normalizedText = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const rawChunks = this.recursiveSplit(
      normalizedText,
      chunkSize,
      separators,
    );

    return this.applyOverlap(rawChunks, chunkOverlap);
  }

  private recursiveSplit(
    text: string,
    chunkSize: number,
    separators: string[],
  ): string[] {
    if (text.length <= chunkSize) {
      return [text];
    }

    for (const separator of separators) {
      const splits = separator ? text.split(separator) : text.split('');

      const chunks: string[] = [];
      let buffer = '';

      for (const part of splits) {
        const candidate = buffer ? buffer + separator + part : part;

        if (candidate.length > chunkSize) {
          if (buffer) {
            chunks.push(buffer.trim());
            buffer = part;
          } else {
            chunks.push(part.slice(0, chunkSize));
            buffer = part.slice(chunkSize);
          }
        } else {
          buffer = candidate;
        }
      }

      if (buffer) chunks.push(buffer.trim());

      if (chunks.length > 1) {
        return chunks.flatMap((c) =>
          this.recursiveSplit(c, chunkSize, separators.slice(1)),
        );
      }
    }

    return [text.slice(0, chunkSize)];
  }

  private applyOverlap(chunks: string[], overlap: number): TextChunk[] {
    const results: TextChunk[] = [];

    let index = 0;
    let startChar = 0;

    for (const chunk of chunks) {
      const endChar = startChar + chunk.length;

      results.push({
        index,
        content: chunk,
        startChar,
        endChar,
      });

      index++;
      startChar = endChar - overlap;
      if (startChar < 0) startChar = 0;
    }

    return results;
  }
}
