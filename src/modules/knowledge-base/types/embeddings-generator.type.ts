import { TextChunk } from './text-chunker.type';

export type GenerateEmbeddingsInput = {
  docId: string;
  chunks: TextChunk[];
};
