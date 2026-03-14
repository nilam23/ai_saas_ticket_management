import { TextChunk } from './text-chunker.type';

export type GenerateEmbeddingsInput = {
  tenantId: string;
  docId: string;
  chunks: TextChunk[];
};
